import { auth } from '@/auth';
import { google, gmail_v1 } from 'googleapis';
import { NextResponse } from 'next/server';
import { GaxiosResponse } from 'gaxios';
import clientPromise from '@/lib/mongodb';

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

async function updateDeletedCount(session: any, deletedCount: number) {
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
        const res: GmailListMessagesResponse = await gmail.users.messages.list({
            userId: 'me',
            q: `from:${email}`
        })
        
        const ids: string[] = res.data.messages?.map(msg => msg.id ?? '') ?? [];

        if (ids.length === 0) {
            const deletedCount = await deleteEmailsFromDB(ids);
            await updateDeletedCount(session, deletedCount);
            return NextResponse.json({ 
                code: 200,
                message: `No emails found from ${email} in Gmail`,
                deletedCount: 0
            })
        }

        try {
            await gmail.users.messages.batchModify({
                userId: 'me',
                requestBody: {
                    ids,
                    addLabelIds: ['TRASH'],
                    removeLabelIds: ['INBOX'],
                },
            });
        } catch (error) {
            console.error('Error batch modifying messages:', error);
            return NextResponse.json({ error: 'Failed to move emails to trash' }, { status: 500 });
        }

        console.log(`Batch moved ${ids.length} messages from ${email} to trash.`);

        const deletedCount = await deleteEmailsFromDB(ids);
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
