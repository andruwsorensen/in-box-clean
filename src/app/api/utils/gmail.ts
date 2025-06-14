import { OAuth2Client } from 'google-auth-library';
import { GaxiosResponse } from 'gaxios';
import { google, gmail_v1 } from 'googleapis';
import pLimit from 'p-limit';

const gmail = google.gmail('v1');
const CONCURRENT_REQUESTS = 100; // Adjust based on Gmail's rate limits

interface EmailId {
    id: string;
    threadId: string;
}

interface GmailListMessagesResponse extends GaxiosResponse<gmail_v1.Schema$ListMessagesResponse> {
    status: number;
}

interface EmailId {
    id: string;
    threadId: string;
}

export interface EmailDetails {
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
            maxResults: 500,
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

export const getEmailDetailsBatch = async (auth: OAuth2Client, messageIds: string[]): Promise<(gmail_v1.Schema$Message | null)[]> => {
    const limit = pLimit(CONCURRENT_REQUESTS);
    
    const requests = messageIds.map(id => 
        limit(async () => {
            try {
                const response = await gmail.users.messages.get({
                    userId: 'me',
                    id: id,
                    auth,
                    format: 'full',
                });
                return response.data;
            } catch (err) {
                console.error(`Error getting email details for ${id}:`, err);
                return null;
            }
        })
    );

    return Promise.all(requests);
};