import { NextResponse } from 'next/server'
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
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

export async function GET(request: Request) {
  try {
    // Load credentials.json file
    const credentialsPath = path.join(process.cwd(), 'src', 'data', 'credentials.json');
    const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf8'));

    // Check if required fields are present in credentials.json file
    // if (!credentials.web.clientId || !credentials.web.clientSecret || !credentials.web.redirectUris) {
    //   throw new Error('credentials.json file is missing required fields. Please update it and try again.');
    // }

    const { client_secret, client_id, redirect_uris } = credentials.web;
    // Create OAuth2 client with credentials
    oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

    // Check for token.json file in data directory
    const tokenPath = path.join(process.cwd(), 'src', 'data', 'token.json');
    let token;

    try {
      token = JSON.parse(await fs.readFile(tokenPath, 'utf8'));
      oAuth2Client.setCredentials(token);
      
      // If we have a valid token, redirect to /main
      return NextResponse.redirect(new URL('/main', request.url));
    } catch (error) {
      // If token.json doesn't exist or is invalid, generate a new auth URL
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });

      return NextResponse.json({ authUrl }, { status: 200 });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}