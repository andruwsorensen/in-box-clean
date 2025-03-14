import { auth } from '@/auth';
import { google, gmail_v1 } from 'googleapis';
import { NextResponse } from 'next/server';
import { GaxiosResponse } from 'gaxios';
import clientPromise from '@/lib/mongodb';
import { Session } from 'next-auth';

interface GmailListMessagesResponse extends GaxiosResponse<gmail_v1.Schema$ListMessagesResponse> {
    status: number;
}

async function deleteEmailsFromDB(ids: string[]) {
    try {
        const client = await clientPromise;
        const db = client.db('in-box-clean');
        const deletedCount = await db.collection('emails').deleteMany({ id: { $in: ids } });
        console.log(`Deleted ${deletedCount.deletedCount} emails from the database.`);
        return deletedCount.deletedCount;
    } catch (error) {
        console.error('Error deleting emails from the database:', error);
        throw error;
    }
}

async function updateDeletedCount(session: Session, deletedCount: number) {
    try {
        const client = await clientPromise;
        const db = client.db('in-box-clean');
        const existingCount = await db.collection('count').findOne({ access_token: session.access_token });

        if (existingCount) {
            const updatedCount = existingCount.count - deletedCount;
            await db.collection('count').updateOne(
                { access_token: session.access_token },
                { $set: { count: updatedCount } }
            );
            console.log(`Updated count to ${updatedCount}`);
        } else {
            console.log('No existing count found, creating new entry');
            await db.collection('count').insertOne({
                access_token: session.access_token,
                count: 0,
                name: session.user?.name
            });
        }
    } catch (error) {
        console.error('Error updating count:', error);
        throw error;
    }
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { email } = await request.json();
    console.log('Email to move to trash:', email);

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({access_token: session.access_token});

    const gmail = google.gmail({version: 'v1', auth: oauth2Client})

    try {
        let allIds: string[] = [];
        let pageToken: string | undefined;

        // Keep fetching pages until we get all messages
        do {
            const res: GmailListMessagesResponse = await gmail.users.messages.list({
                userId: 'me',
                q: `from:${email}`,
                maxResults: 500, // Maximum allowed by Gmail API
                pageToken: pageToken
            });
            
            const pageIds = res.data.messages?.map(msg => msg.id ?? '') ?? [];
            allIds = [...allIds, ...pageIds];
            pageToken = res.data?.nextPageToken?.toString();
        } while (pageToken);

        if (allIds.length === 0) {
            const deletedCount = await deleteEmailsFromDB(allIds);
            await updateDeletedCount(session, deletedCount);
            return NextResponse.json({ 
                code: 200,
                message: `No emails found from ${email} in Gmail`,
                deletedCount: 0
            })
        }

        const batchSize = 100;
        const batches = [];
        for (let i = 0; i < allIds.length; i += batchSize) {
            batches.push(allIds.slice(i, i + batchSize));
        }

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            try {
                await gmail.users.messages.batchModify({
                    userId: 'me',
                    requestBody: {
                        ids: batch,
                        addLabelIds: ['TRASH'],
                        removeLabelIds: ['INBOX'],
                    },
                });
                // Add a delay between batches to avoid going over the quota
                if (i < batches.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
                }
            } catch (error) {
                console.error('Error batch modifying messages:', error);
                return NextResponse.json({ error: 'Failed to move emails to trash' }, { status: 500 });
            }
        }

        console.log(`Batch moved ${allIds.length} messages from ${email} to trash.`);

        const deletedCount = await deleteEmailsFromDB(allIds);
        await updateDeletedCount(session, deletedCount);

        return NextResponse.json({ 
            code: 200, 
            message: 'Emails moved to trash successfully',
            deletedCount: deletedCount
        })
    }
    catch (err) {
        console.error('Error moving emails to trash:', err);
        return NextResponse.json({ error: 'Failed to move emails to trash' }, { status: 500 });
    }    
}
