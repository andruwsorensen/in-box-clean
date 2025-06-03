import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { auth } from '@/auth';
import { Stats } from '../route';

export async function POST() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db('in-box-clean');

        // Reset stats to 0
        const result = await db.collection<Stats>('subscriptionStats').updateOne(
            { userEmail: session.user.email },
            { 
                $set: {
                    deleted: 0,
                    unsubscribed: 0,
                    expires: session.expires
                }
            },
            { upsert: true }
        );

        console.log('Reset stats:', result);
        return NextResponse.json({ 
            code: 200, 
            message: 'Stats reset successfully'
        });
    } catch (error) {
        console.error('Error resetting stats:', error);
        return NextResponse.json({ error: 'Failed to reset stats' }, { status: 500 });
    }
}