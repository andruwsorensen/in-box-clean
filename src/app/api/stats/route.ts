import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export interface Stats {
    unsubscribed: number;
    deleted: number;
}

export async function GET(request: Request) {
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
        const { type, count } = await request.json();
        const statsFilePath = path.join(process.cwd(), 'src', 'data', 'stats.json');
        const stats: Stats = JSON.parse(await fs.readFile(statsFilePath, 'utf-8'));
        if (type === 'deleted') {
            stats.deleted += count;
        } else if (type === 'unsubscribed') {
            stats.unsubscribed += count;
        } else {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }
        await fs.writeFile(statsFilePath, JSON.stringify(stats, null, 2));
        return NextResponse.json({ code: 200, message: 'Stats updated successfully' });
    } catch (error) {
        console.error('Error updating stats:', error);
        return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 });
    }
}