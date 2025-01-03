import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { auth } from '@/auth';

export interface Stats {
    userEmail: string;
    deleted: number;
    expires: string;
    unsubscribed: number;
}

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db('in-box-clean');
        const stats = await db.collection<Stats>('subscriptionStats').findOne({ userEmail: session.user.email });

        if (!stats) {
            // Create default stats if none exist
            const defaultStats: Stats = {
                userEmail: session.user.email,
                deleted: 0,
                expires: session.expires,
                unsubscribed: 0
            };

            await db.collection<Stats>('subscriptionStats').insertOne(defaultStats);
            return NextResponse.json(defaultStats);
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
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db('in-box-clean');

        const { deleted, unsubscribed } = await request.json();
        console.log('Updating stats:', { deleted, unsubscribed });

        const existingStats = await db.collection<Stats>('subscriptionStats').findOne({ userEmail: session.user.email });

        if (!existingStats) {
            // Create default stats if none exist
            const defaultStats: Stats = {
                userEmail: session.user.email,
                deleted: deleted || 0,
                expires: session.expires,
                unsubscribed: unsubscribed || 0
            };

            await db.collection<Stats>('subscriptionStats').insertOne(defaultStats);
            return NextResponse.json({ code: 200, message: 'Stats created successfully' });
        }

        const updateQuery: Partial<Stats> = {
            deleted: existingStats.deleted + (deleted || 0),
            unsubscribed: existingStats.unsubscribed + (unsubscribed || 0)
        };

        const result = await db.collection<Stats>('subscriptionStats').updateOne(
            { userEmail: session.user.email },
            { $set: updateQuery }
        );

        console.log('Updated stats:', result);
        return NextResponse.json({ code: 200, message: 'Stats updated successfully' });
    } catch (error) {
        console.error('Error updating stats:', error);
        return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 });
    }
}