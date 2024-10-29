import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { auth } from '@/auth';

export interface Stats {
    unsubscribed: number;
    deleted: number;
    expires: number;
    sessionId: string;
}

export async function GET() {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db('in-box-clean');
        const stats = await db.collection<Stats>('subscriptionStats').findOne({ sessionId: session.access_token });

        if (!stats) {
            return NextResponse.json({ error: 'Stats not found' }, { status: 404 });
        }

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db('in-box-clean');

        const { deleted, unsubscribed } = await request.json();
        console.log('Updating stats:', { deleted, unsubscribed });

        const existingStats = await db.collection<Stats>('subscriptionStats').findOne({ sessionId: session.access_token });

        const updateQuery: Partial<Stats> = {
            deleted: (existingStats?.deleted || 0) + (deleted || 0),
            unsubscribed: (existingStats?.unsubscribed || 0) + (unsubscribed || 0),
        };

        const result = await db.collection<Stats>('subscriptionStats').updateOne(
            { sessionId: session.access_token },
            { $set: updateQuery },
            { upsert: true }
        );

        console.log('Updated stats:', result);
        return NextResponse.json({ code: 200, message: 'Stats updated successfully' });
    } catch (error) {
        console.error('Error updating stats:', error);
        return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 });
    }
}