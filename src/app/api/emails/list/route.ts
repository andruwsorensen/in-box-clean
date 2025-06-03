import { NextResponse } from 'next/server';
import { listMessages } from '@/app/api/utils/gmail';
import { auth } from '@/auth';
import { google } from 'googleapis';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        console.log('Fetching emails list...');
        const session = await auth();
        if (!session?.access_token || !session?.scope) {
            console.error('Unauthorized access');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const oAuth2Client = new google.auth.OAuth2();
        oAuth2Client.setCredentials({
            access_token: session.access_token,
            scope: session.scope,
        });

        const messages = await listMessages(oAuth2Client);
        const totalMessages = messages.length;
        console.log(`Fetched ${totalMessages} email IDs`);

        const client = await clientPromise;
        const db = client.db('in-box-clean');
        await db.collection('count').updateOne(
            { email: session.user?.email || 'example@example.com' },
            { $set: { count: totalMessages, access_token: session.access_token, name: session.user?.name || 'Example User' } },
            { upsert: true }
        );

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error listing emails:', error);
        return NextResponse.json({ error: 'Failed to list emails' }, { status: 500 });
    }
}
