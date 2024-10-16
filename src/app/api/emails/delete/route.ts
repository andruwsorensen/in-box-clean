import { auth } from '@/auth';
import { google, gmail_v1 } from 'googleapis';
import { NextResponse } from 'next/server';
import { GaxiosResponse } from 'gaxios';

interface GmailListMessagesResponse extends GaxiosResponse<gmail_v1.Schema$ListMessagesResponse> {
    // add some type of member here even if not used
    // this is just to make the compiler happy so it can't be type any
    status: number;
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { email } = await request.json();
    console.log('Email to delete:', email);

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({access_token: session.access_token});

    const gmail = google.gmail({version: 'v1', auth: oauth2Client})

    try {
        const res: GmailListMessagesResponse = await gmail.users.messages.list({
            userId: 'me',
            q: `from:${email}`
        })
        
        const ids: string[] = res.data.messages?.map(msg => msg.id ?? '') ?? [];

        if (ids.length === 0) {
            return NextResponse.json({ error: 'No emails found' }, { status: 400 });
        }

        try {
            await gmail.users.messages.batchDelete({
                userId: 'me',
                requestBody: {
                    ids,
                },
            });
        } catch (error) {
            console.error('Error batch deleting messages:', error);
            return NextResponse.json({ error: 'Failed to delete emails' }, { status: 500 });
        }
          console.log(`Batch deleted ${ids.length} messages from Gmail.`);
          return NextResponse.json({ 
            code: 200, 
            message: 'Emails deleted successfully',
            deletedCount: ids.length 
          })
    }
    catch (err) {
        console.error('Error deleting emails:', err);
        return NextResponse.json({ error: 'Failed to delete emails' }, { status: 500 });
    }    
}