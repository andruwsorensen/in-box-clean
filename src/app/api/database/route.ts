import { NextResponse } from 'next/server';
import { EmailDetails } from '@/app/api/utils/gmail';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';

interface DatabaseOperationResult {
    inserted: number;
    updated: number;
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.access_token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const emails: EmailDetails[] = await request.json();

        const client = await clientPromise;
        const db = client.db('in-box-clean');
        const sessionId = session.access_token;
        const expires = session.expires;

        const existingEmailIds = await db.collection('emails').distinct('id');

        const emailsToInsert = emails.filter(email => !existingEmailIds.includes(email.id));
        const emailsToUpdate = emails.filter(email => existingEmailIds.includes(email.id));

        const insertResult = await db.collection('emails').insertMany(
            emailsToInsert.map(email => ({ ...email, sessionId, expires }))
        );

        const updateResult = await db.collection('emails').updateMany(
            { id: { $in: emailsToUpdate.map(email => email.id) } },
            { $set: { sessionId, expires } }
        );

        const stats = {
            unsubscribed: 0,
            deleted: 0,
            expires: session.expires,
            sessionId: session.access_token
        };

        await db.collection('stats').insertOne({ ...stats });

        const result: DatabaseOperationResult = {
            inserted: insertResult.insertedCount,
            updated: updateResult.modifiedCount
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error processing database operations:', error);
        return NextResponse.json({ error: 'Failed to process database operations' }, { status: 500 });
    }
}