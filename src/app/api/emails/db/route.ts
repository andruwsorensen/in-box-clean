import { NextResponse } from 'next/server';
import { EmailDetails } from '@/app/api/utils/gmail';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';

interface DatabaseOperationResult {
    inserted: number;
}

export async function POST(request: Request) {
    try {
        console.log('Saving emails to the database...');
        const session = await auth();
        if (!session?.user?.email) {
            console.log('Unauthorized access');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const emails: EmailDetails[] = await request.json();

        console.log('Received emails:', emails.length);

        if (emails.length === 0) {
            console.log('Email array is empty');
            throw new Error('Email array is empty');
        }

        const client = await clientPromise;
        const db = client.db('in-box-clean');
        const userEmail = session.user.email;
        const expires = session.expires;

        // Directly insert all received emails
        const insertResult = await db.collection('emails').insertMany(
            emails.map(email => ({ ...email, userEmail, expires }))
        );

        // Use upsert to ensure only one stats document per user
        await db.collection('subscriptionStats').updateOne(
            { userEmail },
            {
                $setOnInsert: {
                    unsubscribed: 0,
                    deleted: 0,
                    expires: session.expires,
                    userEmail
                }
            },
            { upsert: true }
        );

        const result: DatabaseOperationResult = {
            inserted: insertResult.insertedCount,
        };

        console.log('Database operations completed successfully:', result);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error processing database operations:', error);
        return NextResponse.json({ error: 'Failed to process database operations' }, { status: 500 });
    }
}