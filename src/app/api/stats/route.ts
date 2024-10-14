import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export interface Stats {
    unsubscribed: number;
    deleted: number;
}

export async function GET() {
    try {
        const statsFilePath = path.join(process.cwd(), 'src', 'data', 'stats.json');
        const stats: Stats = JSON.parse(await fs.readFile(statsFilePath, 'utf-8'));
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const statsFilePath = path.join(process.cwd(), 'src', 'data', 'stats.json');
        const stats: Stats = JSON.parse(await fs.readFile(statsFilePath, 'utf-8'));

        const { deleted, unsubscribed } = await request.json();
        console.log('Updating stats:', { deleted, unsubscribed });

        if (typeof deleted === 'number') {
            stats.deleted += deleted;
        }
        if (typeof unsubscribed === 'number') {
            stats.unsubscribed += unsubscribed;
        }

        await fs.writeFile(statsFilePath, JSON.stringify(stats, null, 2));
        console.log('Updated stats:', stats);
        return NextResponse.json({ code: 200, message: 'Stats updated successfully' });
    } catch (error) {
        console.error('Error updating stats:', error);
        return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 });
    }
}