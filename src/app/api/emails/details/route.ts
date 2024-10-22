import { NextResponse } from 'next/server';
import { getEmailDetails } from '@/app/api/utils/gmail';
import { auth } from '@/auth';
import { google } from 'googleapis';

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.access_token || !session?.scope) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const emailIds: { id: string }[] = await request.json();

        if (!emailIds || emailIds.length === 0) {
            return NextResponse.json({ error: 'Email IDs are required' }, { status: 400 });
        }

        const oAuth2Client = new google.auth.OAuth2();
        oAuth2Client.setCredentials({
            access_token: session.access_token,
            scope: session.scope,
        });

        const emailDetails = await Promise.all(emailIds.map(({ id }) => getEmailDetails(oAuth2Client, id)));

        return NextResponse.json(emailDetails.filter(Boolean));
    } catch (error) {
        console.error('Error getting email details:', error);
        return NextResponse.json({ error: 'Failed to get email details' }, { status: 500 });
    }
}