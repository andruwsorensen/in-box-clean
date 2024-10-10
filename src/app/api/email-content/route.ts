import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function POST(request: Request) {
  try {
    const { from } = await request.json();
    
    const filePath = path.join(process.cwd(), 'src', 'data', 'emails.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const emails = JSON.parse(data);

    const email = emails.find((email: any) => {
      const fromHeader = email.payload.headers.find((header: any) => header.name === 'From');
      return fromHeader && fromHeader.value.includes(from);
    });

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    // Construct email content
    const headers = email.payload.headers.map((header: any) => `${header.name}: ${header.value}`).join('\n');
    const body = email.payload.body.data 
      ? Buffer.from(email.payload.body.data, 'base64').toString('utf-8')
      : 'No body content';

    const fullEmailContent = `${headers}\n\n${body}`;

    return NextResponse.json({ emailContent: fullEmailContent });
  } catch (error) {
    console.error('Error fetching email content:', error);
    return NextResponse.json({ error: 'Failed to fetch email content' }, { status: 500 });
  }
}