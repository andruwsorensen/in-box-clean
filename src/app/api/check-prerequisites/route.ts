import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(request: Request) {
  try {
    const tokenFilePath = path.join(process.cwd(), 'src', 'data', 'token.json');
    const tokenFileExists = await fs.stat(tokenFilePath).catch(() => false);

    if (tokenFileExists) {
      return NextResponse.json({ prerequisites: true });
    } else {
      return NextResponse.json({ error: 'Prerequisites not met' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error checking prerequisites:', error);
    return NextResponse.json({ error: 'Failed to check prerequisites' }, { status: 500 });
  }
}
