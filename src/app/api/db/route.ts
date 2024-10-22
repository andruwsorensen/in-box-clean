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
        console.log('Saving emails to the database...');
        const session = await auth();
        if (!session?.access_token) {
            console.log('Unauthorized access');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const emails: EmailDetails[] = await request.json();

        console.log('Emails to save:', emails);

        if (emails.length === 0) {
            console.log('Email array is empty');
            throw new Error('Email array is empty');
        }

        const client = await clientPromise;
        const db = client.db('in-box-clean');
        const sessionId = session.access_token;
        const expires = session.expires;

        console.log('Checking for existing email IDs...');
        const existingEmailIds = await db.collection('emails').distinct('id');

        const emailsToInsert = emails.filter(email => !existingEmailIds.includes(email.id));
        const emailsToUpdate = emails.filter(email => existingEmailIds.includes(email.id));

        console.log(`Inserting ${emailsToInsert.length} new emails...`);
        const insertResult = await db.collection('emails').insertMany(
            emailsToInsert.map(email => ({ ...email, sessionId, expires }))
        );

        console.log(`Updating ${emailsToUpdate.length} existing emails...`);
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

        console.log('Inserting stats...');
        await db.collection('stats').insertOne({ ...stats });

        const result: DatabaseOperationResult = {
            inserted: insertResult.insertedCount,
            updated: updateResult.modifiedCount
        };

        console.log('Database operations completed successfully:', result);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error processing database operations:', error);
        return NextResponse.json({ error: 'Failed to process database operations' }, { status: 500 });
    }
}