import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

interface EmailHeader {
  name: string;
  value: string;
}

interface EmailPayload {
  headers: EmailHeader[];
  body: {
    data?: string;
  };
}

interface EmailData {
  payload: EmailPayload;
}

export async function POST(request: Request) {
  try {
    const { from } = await request.json() as { from: string };

    const client = await clientPromise;
    const db = client.db('in-box-clean');
    const emailData = await db.collection<EmailData>('emails').findOne({ 'payload.headers': { $elemMatch: { name: 'From', value: { $regex: new RegExp(from, 'i') } } } });

    if (!emailData) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    // Construct email content
    const headers = emailData.payload.headers.map((header) => `${header.name}: ${header.value}`).join('\n');
    const body = emailData.payload.body.data
      ? Buffer.from(emailData.payload.body.data, 'base64').toString('utf-8')
      : 'No body content';

    const fullEmailContent = `${headers}\n\n${body}`;

    return NextResponse.json({ emailContent: fullEmailContent });
  } catch (error) {
    console.error('Error fetching email content:', error);
    return NextResponse.json({ error: 'Failed to fetch email content' }, { status: 500 });
  }
}