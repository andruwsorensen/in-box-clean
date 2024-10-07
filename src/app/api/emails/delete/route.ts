import { getOAuth2Client } from '@/app/api/utils/auth';
import { batchDeleteMessages } from '@/app/api/utils/gmail';
import { getEmailIds } from '@/app/api/utils/gmail';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const oAuth2Client = await getOAuth2Client();

    const { email } = await request.json();
    const ids = await getEmailIds(oAuth2Client, email);

    if (!ids || !Array.isArray(ids)) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    try {
        const success = await batchDeleteMessages(oAuth2Client, ids);
        if (success) {
            console.log(`Deleted emails with ids: ${ids.join(', ')}`);
            return NextResponse.json({ 
                code: 200, 
                message: 'Emails deleted successfully',
                deletedCount: ids.length 
            });
        } else {
            return NextResponse.json({ code: 500, message: 'Failed to delete emails' });
        }
    } catch (error) {
        console.error('Error trashing emails:', error);
        return NextResponse.json({ error: 'Failed to trash emails' }, { status: 500 });
    }
}