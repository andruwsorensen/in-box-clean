import { getOAuth2Client } from '@/app/api/utils/auth';
import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { OAuth2Client } from 'google-auth-library';
import { NextResponse } from 'next/server';
import { listMessages, getEmailDetails, EmailDetails } from '@/app/api/utils/gmail';

export async function GET(request: Request) {
    try {
        const oAuth2Client = await getOAuth2Client();

        const messages = await listMessages(oAuth2Client);

        const emails = await Promise.all(messages.map(async (message) => {
            return await getEmailDetails(oAuth2Client, message.id);
        }));

        const validEmails = emails.filter((email): email is EmailDetails => email !== null);

        await fs.writeFile(
            path.join(process.cwd(), 'src', 'data', 'emails.json'),
            JSON.stringify(validEmails, null, 2)
        );

        const stats = {
            unsubscribed: 0,
            deleted: 0
        };

        await fs.writeFile(
            path.join(process.cwd(), 'src', 'data', 'stats.json'),
            JSON.stringify(stats, null, 2)
        );

        return NextResponse.json(validEmails);
    } catch (error) {
        console.error('Error processing emails:', error);
        return NextResponse.json({ error: 'Failed to process emails' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const oAuth2Client = await getOAuth2Client();
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
