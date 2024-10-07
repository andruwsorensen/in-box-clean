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

export const getOAuth2Client = async (): Promise<OAuth2Client> => {
  const credentialsPath = path.join(process.cwd(), 'src', 'data', 'credentials.json');
  const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf8'));

  const tokenPath = path.join(process.cwd(), 'src', 'data', 'token.json');
  let token;

  try {
    token = JSON.parse(await fs.readFile(tokenPath, 'utf8'));
  } catch (error) {
    console.error('Error reading token.json:', error);
    throw error;
  }

  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oAuth2Client.setCredentials(token);

  return oAuth2Client;
};

export const batchDeleteMessages = async (auth: any, messageIds: string[]) => {
    try {
      await gmail.users.messages.batchDelete({
        userId: 'me',
        requestBody: {
          ids: messageIds,
        },
        auth,
      });
      console.log(`Batch deleted ${messageIds.length} messages.`);
      return true;
    } catch (err) {
      console.error('Error batch deleting messages:', err);
      return false;
    }
  };