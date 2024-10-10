import { NextResponse, NextRequest } from 'next/server'
import { OAuth2Client } from "google-auth-library";
import fs from 'fs/promises';
import path from 'path';

let oAuth2Client: OAuth2Client;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    console.log('Received code:', code);

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    // Load credentials.json file
    const credentialsPath = path.join(process.cwd(), 'src', 'data', 'credentials.json');
    const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf8'));

    const { client_secret, client_id, redirect_uris } = credentials.web;
    oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Save the tokens to token.json
    const tokenPath = path.join(process.cwd(), 'src', 'data', 'token.json');
    await fs.writeFile(tokenPath, JSON.stringify(tokens));

    const mainUrl = new URL('/main', request.url);
    mainUrl.searchParams.set('showModal', 'true');

    return NextResponse.redirect(mainUrl);
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json({ error: 'Failed to exchange authorization code for tokens' }, { status: 500 });
  }
}