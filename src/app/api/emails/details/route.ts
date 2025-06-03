import { NextResponse } from 'next/server';
import { getEmailDetails } from '@/app/api/utils/gmail';
import { auth } from '@/auth';
import { google } from 'googleapis';

// Maximum size in bytes (10MB)
const MAX_EMAIL_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
    try {
        console.log('Fetching email details...');
        const session = await auth();
        if (!session?.access_token || !session?.scope) {
            console.error('Unauthorized access');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const ids: string[] = await request.json();

        if (!Array.isArray(ids) || ids.length === 0) {
            console.error('No email IDs provided');
            return NextResponse.json({ error: 'Email IDs are required' }, { status: 400 });
        }

        console.log(`Fetching details for ${ids.length} emails`);

        const oAuth2Client = new google.auth.OAuth2();
        oAuth2Client.setCredentials({
            access_token: session.access_token,
            scope: session.scope,
        });

        const emailDetails = await Promise.all(ids.map( id  => getEmailDetails(oAuth2Client, id)));

        // Filter out emails that are too large
        const filteredEmails = emailDetails.filter(email => {
            if (!email) return false;
            const size = JSON.stringify(email).length;
            return size <= MAX_EMAIL_SIZE;
        });

        console.log(`Fetched details for ${filteredEmails.length} emails (${emailDetails.length - filteredEmails.length} were too large)`);

        return NextResponse.json(filteredEmails);
    } catch (error) {
        console.error('Error getting email details:', error);
        return NextResponse.json({ error: 'Failed to get email details' }, { status: 500 });
    }
}