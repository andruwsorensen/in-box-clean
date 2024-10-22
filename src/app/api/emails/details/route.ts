import { NextResponse } from 'next/server';
import { getEmailDetails } from '@/app/api/utils/gmail';
import { auth } from '@/auth';
import { google } from 'googleapis';

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.access_token || !session?.scope) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const messageId = searchParams.get('id');

        if (!messageId) {
            return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
        }

        const oAuth2Client = new google.auth.OAuth2();
        oAuth2Client.setCredentials({
            access_token: session.access_token,
            scope: session.scope,
        });

        const emailDetails = await getEmailDetails(oAuth2Client, messageId);
        if (!emailDetails) {
            return NextResponse.json({ error: 'Email not found' }, { status: 404 });
        }

        return NextResponse.json(emailDetails);
    } catch (error) {
        console.error('Error getting email details:', error);
        return NextResponse.json({ error: 'Failed to get email details' }, { status: 500 });
    }
}