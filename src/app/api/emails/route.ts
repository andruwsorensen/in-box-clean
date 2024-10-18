// import { getOAuth2Client } from '@/app/api/utils/auth';
import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { listMessages, getEmailDetails, EmailDetails } from '@/app/api/utils/gmail';
import { auth } from '@/auth';
import { google } from 'googleapis';
import clientPromise from '@/lib/mongodb';



export async function GET() {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!session.access_token || !session.scope) {
            return NextResponse.json({ error: 'Access token or scope not found' }, { status: 401 });
        }

        const oAuth2Client = new google.auth.OAuth2();
        oAuth2Client.setCredentials({
            access_token: session.access_token as string,
            scope: session.scope as string,
        });

        const messages = await listMessages(oAuth2Client);

        const emails = await Promise.all(messages.map(async (message) => {
            return await getEmailDetails(oAuth2Client, message.id);
        }));

        const validEmails = emails.filter((email): email is EmailDetails => email !== null);
        
        try {
            const client = await clientPromise;
            const db = client.db('in-box-clean');
            await db.collection('emails').insertMany(validEmails);
        } catch (error) {
            console.error('Error inserting emails into MongoDB:', error);
        }

        const stats = {
            unsubscribed: 0,
            deleted: 0
        };

        try {
            const client = await clientPromise;
            const db = client.db('in-box-clean');
            await db.collection('stats').insertOne(stats);
        } catch (error) {
            console.error('Error inserting stats into MongoDB:', error);
        }

        return NextResponse.json(validEmails);
    } catch (error) {
        console.error('Error processing emails:', error);
        return NextResponse.json({ error: 'Failed to process emails' }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const oAuth2Client = new google.auth.OAuth2();
        oAuth2Client.setCredentials({access_token: session.access_token});
        const emails = await listMessages(oAuth2Client);
        const validEmails = emails.filter((email): email is EmailDetails => email !== null);

        await fs.writeFile(
            path.join(process.cwd(), 'src', 'data', 'emails.json'),
            JSON.stringify(validEmails, null, 2)
        );

        return NextResponse.json(validEmails);
    } catch (error) {
        console.error('Error processing emails:', error);
        return NextResponse.json({ error: 'Failed to process emails' }, { status: 500 });
    }
}
