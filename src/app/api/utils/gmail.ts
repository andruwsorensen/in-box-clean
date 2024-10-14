import { OAuth2Client } from 'google-auth-library';
import { GaxiosResponse } from 'gaxios';
import { google, gmail_v1 } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';

const gmail = google.gmail('v1');

interface EmailId {
    id: string;
    threadId: string;
}

interface EmailHeader {
    name: string;
    value: string;
}

interface EmailPayload {
    headers: EmailHeader[];
}

interface EmailData {
    id: string;
    threadId: string;
    payload: EmailPayload;
}

interface GmailListMessagesResponse extends GaxiosResponse<gmail_v1.Schema$ListMessagesResponse> {
    // add some type of member here even if not used
    // this is just to make the compiler happy so it can't be type any
    status: number;
}

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


export const batchDeleteMessages = async (auth: OAuth2Client, messageIds: string[]) => {
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
    const emails: EmailData[] = JSON.parse(data);
    const updatedEmails = emails.filter(email => !messageIds.includes(email.id));
    await fs.writeFile(filePath, JSON.stringify(updatedEmails, null, 2));
    console.log(`Deleted ${messageIds.length} emails from emails.json file.`);

    return true;
  } catch (err) {
    console.error('Error batch deleting messages:', err);
    return false;
  }
};

export const listMessages = async (auth: OAuth2Client): Promise<EmailId[]> => {
    let allMessages: EmailId[] = [];
    let pageToken: string | undefined = undefined;
  
    do {
        const response: GmailListMessagesResponse = await gmail.users.messages.list({
            userId: 'me',
            auth,
            maxResults: 100,
            pageToken,
        });
  
        const messages = (response.data.messages ?? []).map(msg => ({
            id: msg.id ?? '',
            threadId: msg.threadId ?? ''
        }));
        allMessages = allMessages.concat(messages);
        pageToken = response.data.nextPageToken ?? undefined;
    } while (pageToken);
  
    return allMessages;
};

export const getEmailDetails = async (auth: OAuth2Client, messageId: string): Promise<gmail_v1.Schema$Message | null> => {
    try {
        const response = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            auth,
            format: 'full',
        });
        return response.data;
    } catch (err) {
        console.error('Error getting email details:', err);
        return null;
    }
};

export const getEmailIds = async (email: string): Promise<string[]> => {
    try {
        const filePath = path.join(process.cwd(), 'src', 'data', 'emails.json');
        const data = await fs.readFile(filePath, 'utf-8');
        const emails: EmailData[] = JSON.parse(data);

        const emailIds = emails
            .filter(emailObj => {
                const fromHeader = emailObj.payload.headers.find(header => header.name === 'From');
                return fromHeader && fromHeader.value.includes(email);
            })
            .map(emailObj => emailObj.id);

        return emailIds;
    } catch (err) {
        console.error('Error getting email IDs:', err);
        return [];
    }
};