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
            const sessionId = session.access_token;
            const expires = session.expires;

            const existingEmailIds = await db.collection('emails').distinct('id');

            const emailsToInsert = validEmails.filter(email => !existingEmailIds.includes(email.id));
            const emailsToUpdate = validEmails.filter(email => existingEmailIds.includes(email.id));

            await db.collection('emails').insertMany(emailsToInsert.map(email => ({ ...email, sessionId, expires })));

            await db.collection('emails').updateMany(
                { id: { $in: emailsToUpdate.map(email => email.id) } },
                { $set: { sessionId, expires } }
            );
        } catch (error) {
            console.error('Error inserting/updating emails into MongoDB:', error);
        }

        const stats = {
            unsubscribed: 0,
            deleted: 0,
            expires: session.expires,
            sessionId: session.access_token
        };

        try {
            const client = await clientPromise;
            const db = client.db('in-box-clean');
            await db.collection('stats').insertOne({ ...stats });
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

        return NextResponse.json(validEmails);
    } catch (error) {
        console.error('Error processing emails:', error);
        return NextResponse.json({ error: 'Failed to process emails' }, { status: 500 });
    }
}
