import { NextResponse } from 'next/server';
import { getEmailDetails } from '@/app/api/utils/gmail';
import { auth } from '@/auth';
import { google } from 'googleapis';

export async function POST(request: Request) {
    try {
        console.log('Fetching email details...');
        const session = await auth();
        if (!session?.access_token || !session?.scope) {
            console.error('Unauthorized access');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const emailIds: { id: string }[] = await request.json();

        if (!emailIds || emailIds.length === 0) {
            console.error('No email IDs provided');
            return NextResponse.json({ error: 'Email IDs are required' }, { status: 400 });
        }

        console.log(`Fetching details for ${emailIds.length} emails`);

        const oAuth2Client = new google.auth.OAuth2();
        oAuth2Client.setCredentials({
            access_token: session.access_token,
            scope: session.scope,
        });

        const emailDetails = await Promise.all(emailIds.map(({ id }) => getEmailDetails(oAuth2Client, id)));

        console.log(`Fetched details for ${emailDetails.filter(Boolean).length} emails`);

        return NextResponse.json(emailDetails.filter(Boolean));
    } catch (error) {
        console.error('Error getting email details:', error);
        return NextResponse.json({ error: 'Failed to get email details' }, { status: 500 });
    }
}