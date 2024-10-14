import { NextResponse } from 'next/server'
import { OAuth2Client } from "google-auth-library";
import fs from 'fs/promises';
import path from 'path';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.settings.basic',
  'https://www.googleapis.com/auth/gmail.settings.sharing',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://mail.google.com/'
];

let oAuth2Client: OAuth2Client;

export async function GET() {
  try {
    // Load credentials.json file
    const credentialsPath = path.join(process.cwd(), 'src', 'data', 'credentials.json');
    const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf8'));

    const { client_secret, client_id, redirect_uris } = credentials.web;
    // Create OAuth2 client with credentials
    oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

    const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    });

      return NextResponse.json({ authUrl }, { status: 200 });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}