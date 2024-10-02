import { NextResponse } from 'next/server'
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import fs from 'fs/promises';
import path from 'path';

let oAuth2Client: OAuth2Client;
const gmail = google.gmail('v1');

interface EmailId {
    id: string;
    threadId: string;
}

interface EmailDetails {
    // Define the structure of email details here
    id: string;
    threadId: string;
    // Add other relevant fields
}

const listMessages = async (auth: OAuth2Client): Promise<EmailId[]> => {
    let allMessages: EmailId[] = [];
    let pageToken: string | null = null;
  
    do {
        const response: any = await gmail.users.messages.list({
            userId: 'me',
            auth,
            maxResults: 100,
            pageToken: pageToken || undefined,
        });
  
        allMessages = allMessages.concat(response.data.messages || []);
        pageToken = response.data.nextPageToken || null;
    } while (pageToken);
  
    return allMessages;
};

const getEmailDetails = async (auth: OAuth2Client, messageId: string): Promise<EmailDetails | null> => {
    try {
        const response = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            auth,
            format: 'full',
        });
        return response.data as EmailDetails;
    } catch (err) {
        console.error('Error getting email details:', err);
        return null;
    }
};

export async function GET(request: Request) {
    try {
        const credentialsPath = path.join(process.cwd(), 'src', 'data', 'credentials.json');
        const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf8'));

        const tokenPath = path.join(process.cwd(), 'src', 'data', 'token.json');
        const token = JSON.parse(await fs.readFile(tokenPath, 'utf8'));

        const { client_secret, client_id, redirect_uris } = credentials.web;
        oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        oAuth2Client.setCredentials(token);

        const messages = await listMessages(oAuth2Client);

        const emails = await Promise.all(messages.map(async (message) => {
            return await getEmailDetails(oAuth2Client, message.id);
        }));

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
