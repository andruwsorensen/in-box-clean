import { auth } from '@/auth';
import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Session } from 'next-auth';

  async function deleteEmailsFromDB(email: string) {
    try {
        const client = await clientPromise;
        const db = client.db('in-box-clean');
        
        console.log('Searching for emails with:', email);
        
        // Query the nested structure where the From header is stored
        const emailsToDelete = await db.collection('emails').find({
            'payload.headers': {
                $elemMatch: {
                    name: 'From',
                    value: { $regex: email, $options: 'i' } // Case insensitive match for the email
                }
            }
        }).toArray();
        
        const ids = emailsToDelete.map(email => email.id);
        
        // Use the same query for deletion
        const deletedResult = await db.collection('emails').deleteMany({
            'payload.headers': {
                $elemMatch: {
                    name: 'From',
                    value: { $regex: email, $options: 'i' }
                }
            }
        });
        
        console.log('deletedResult', deletedResult);
        console.log(`Deleted ${deletedResult.deletedCount} emails from the database for ${email}`);
        
        return {
            deletedCount: deletedResult.deletedCount,
            ids
        };
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
        // First delete from DB and get the IDs
        const { deletedCount, ids } = await deleteEmailsFromDB(email);
        
        if (ids.length === 0) {
            await updateDeletedCount(session, deletedCount);
            return NextResponse.json({ 
                code: 200,
                message: `No emails found from ${email} in Gmail`,
                deletedCount: 0
            });
        }

        // Process Gmail deletion in batches
        const batchSize = 100;
        const batches = [];
        for (let i = 0; i < ids.length; i += batchSize) {
            batches.push(ids.slice(i, i + batchSize));
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
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                console.error('Error batch modifying messages:', error);
                return NextResponse.json({ error: 'Failed to move emails to trash' }, { status: 500 });
            }
        }

        console.log(`Batch moved ${ids.length} messages from ${email} to trash.`);
        await updateDeletedCount(session, deletedCount);

        return NextResponse.json({ 
            code: 200, 
            message: 'Emails moved to trash successfully',
            deletedCount
        });
    }
    catch (err) {
        console.error('Error moving emails to trash:', err);
        return NextResponse.json({ error: 'Failed to move emails to trash' }, { status: 500 });
    }    
}