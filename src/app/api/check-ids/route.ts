import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';

interface CheckIdsResult {
    newIds: string[];
    count: number;
}

export async function POST(request: Request) {
    try {
        console.log('Checking for new email IDs...');
        const session = await auth();
        if (!session?.user?.email) {
            console.log('Unauthorized access');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { ids }: { ids: string[] } = await request.json();
        console.log('Received IDs to check:', ids.length);

        if (ids.length === 0) {
            console.log('ID array is empty');
            throw new Error('ID array is empty');
        }

        const client = await clientPromise;
        const db = client.db('in-box-clean');

        console.log('Checking for existing email IDs...');
        const existingEmailIds = await db.collection('emails').distinct('id');

        // Filter out IDs that already exist in the database
        const newIds = ids.filter(id => !existingEmailIds.includes(id));
        console.log(`Found ${newIds.length} new IDs out of ${ids.length} total`);

        const result: CheckIdsResult = {
            newIds,
            count: newIds.length
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error checking email IDs:', error);
        return NextResponse.json({ error: 'Failed to check email IDs' }, { status: 500 });
    }
}