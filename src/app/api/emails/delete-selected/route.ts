import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { google } from 'googleapis';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { ids } = await request.json();
    if (!ids || !Array.isArray(ids)) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({access_token: session.access_token});
    const gmail = google.gmail({version: 'v1', auth: oauth2Client});

    try {
        // Delete in batches of 100
        const batchSize = 100;
        for (let i = 0; i < ids.length; i += batchSize) {
            const batch = ids.slice(i, i + batchSize);
            await gmail.users.messages.batchModify({
                userId: 'me',
                requestBody: {
                    ids: batch,
                    addLabelIds: ['TRASH'],
                    removeLabelIds: ['INBOX'],
                },
            });
            
            if (i < ids.length - batchSize) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
            }
        }

        // Delete from database
        const client = await clientPromise;
        const db = client.db('in-box-clean');
        const result = await db.collection('emails').deleteMany({ id: { $in: ids } });

        // Update count
        await db.collection('count').updateOne(
            { access_token: session.access_token },
            { $inc: { count: -ids.length } }
        );

        return NextResponse.json({ 
            code: 200, 
            message: 'Emails deleted successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error deleting emails:', error);
        return NextResponse.json({ error: 'Failed to delete emails' }, { status: 500 });
    }
}