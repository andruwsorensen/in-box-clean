// utils/auth.ts
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.settings.basic',
  'https://www.googleapis.com/auth/gmail.settings.sharing',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://mail.google.com/',
];

const gmail = google.gmail('v1');

export const batchDeleteMessages = async (auth: any, messageIds: string[]) => {
  try {
    // Delete emails from Gmail
    await gmail.users.messages.batchDelete({
      userId: 'me',
      requestBody: {
        ids: messageIds,
      },
      auth,
    });
    console.log(`Batch deleted ${messageIds.length} messages from Gmail.`);

    // Delete emails from emails.json file
    const filePath = path.join(process.cwd(), 'src', 'data', 'emails.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const emails: any[] = JSON.parse(data);
    const updatedEmails = emails.filter(email => !messageIds.includes(email.id));
    await fs.writeFile(filePath, JSON.stringify(updatedEmails, null, 2));
    console.log(`Deleted ${messageIds.length} emails from emails.json file.`);

    return true;
  } catch (err) {
    console.error('Error batch deleting messages:', err);
    return false;
  }
};

interface EmailId {
    id: string;
    threadId: string;
}

export interface EmailDetails {
    // Define the structure of email details here
    id: string;
    threadId: string;
    // Add other relevant fields
}

export const listMessages = async (auth: OAuth2Client): Promise<EmailId[]> => {
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

export const getEmailDetails = async (auth: OAuth2Client, messageId: string): Promise<EmailDetails | null> => {
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

export const getEmailIds = async (auth: OAuth2Client, email: string): Promise<string[]> => {
    try {
        const response = await gmail.users.messages.list({
            userId: 'me',
            auth,
            q: `from:${email}`,
            maxResults: 100,
        });

        // Define the expected shape of the response data
        interface GmailListMessagesResponse {
            messages?: { id: string }[];
        }

        const data = response.data as GmailListMessagesResponse;
        return data.messages?.map(({ id }) => id) || [];
    } catch (err) {
        console.error('Error getting email IDs:', err);
        return [];
    }
};
