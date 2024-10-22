import { NextResponse } from 'next/server';
import { listMessages, EmailDetails } from '@/app/api/utils/gmail';
import { auth } from '@/auth';
import { google } from 'googleapis';


export async function GET() {
    try {
        const session = await auth();
        if (!session?.access_token || !session?.scope) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const oAuth2Client = new google.auth.OAuth2();
        oAuth2Client.setCredentials({
            access_token: session.access_token,
            scope: session.scope,
        });

        const messages = await listMessages(oAuth2Client);
        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error listing emails:', error);
        return NextResponse.json({ error: 'Failed to list emails' }, { status: 500 });
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
