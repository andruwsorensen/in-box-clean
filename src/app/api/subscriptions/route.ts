import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { auth } from '@/auth';

interface EmailDetails {
  id: string;
  threadId: string;
  subject: string;
  snippet: string;
  date: string;
  from: string;
  fromName: string;
  fromEmail: string;
  fromDomain: string;
  isSubscription: boolean;
}

interface EmailHeader {
  name: string;
  value: string;
}

interface EmailPayload {
  headers: EmailHeader[];
}

interface EmailData {
  id: string;
  threadId: string;
  subject: string;
  snippet: string;
  date: string;
  fromName: string;
  fromEmail: string;
  fromDomain: string;
  isSubscription: boolean;
  payload: EmailPayload;
  userId: string;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('in-box-clean');
    const emails = await db.collection<EmailData>('emails').find({ userId: session.user.email }).toArray();

    const extractedEmails: EmailDetails[] = emails.map((email) => ({
      id: email.id,
      threadId: email.threadId,
      subject: email.payload.headers.find((header) => header.name === 'Subject')?.value || 'No Subject',
      snippet: email.snippet,
      date: new Date(email.payload.headers.find((header) => header.name === 'Date')?.value || '').toLocaleString('en-US', { month: 'short', year: 'numeric' }) || '',
      from: email.payload.headers.find((header) => header.name === 'From')?.value || 'Unknown',
      fromName: extractName(email.payload.headers.find((header) => header.name === 'From')?.value || 'Unknown'),
      fromEmail: extractEmail(email.payload.headers.find((header) => header.name === 'From')?.value || 'Unknown'),
      fromDomain: extractDomain(email.payload.headers.find((header) => header.name === 'Authentication-Results')?.value || 'Unknown'),
      isSubscription: !email.payload.headers.some((header) => header.name === 'Subscribed') && (
        email.payload.headers.some((header) =>
          header.name === 'List-Unsubscribe' ||
          (header.name === 'Precedence' && (header.value === 'bulk' || header.value === 'list')) ||
          header.name === 'X-Mailer' ||
          header.name === 'X-Newsletter' ||
          (header.name === 'From' &&
            (header.value.includes('@news.') || header.value.includes('@mailchimp.com') ||
              header.value.includes('@newsletter.') || header.value.includes('@marketing.') || 
              header.value.includes('@info.') || header.value.includes('@updates.'))) ||
          (header.name === 'Subject' &&
            (header.value.toLowerCase().includes('newsletter') ||
              header.value.toLowerCase().includes('digest')))
        )
      )
    }));

    return NextResponse.json(extractedEmails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { from } = await request.json();
    console.log(from);
    const email = from;
    try {
        const client = await clientPromise;
        const db = client.db('in-box-clean');
        const updatedEmails = await db.collection<EmailData>('emails').updateMany(
            { userId: session.user.email, 'payload.headers': { $elemMatch: { name: 'From', value: { $regex: email, $options: 'i' } } } },
            { $push: { 'payload.headers': { name: 'Subscribed', value: 'This was kept' } } }
        );
        console.log('Email update count: ', updatedEmails.modifiedCount);
        return NextResponse.json({ code: 200, message: 'Emails updated successfully' });
    } catch (error) {
        console.error('Error updating emails:', error);
        return NextResponse.json({ error: 'Failed to update emails' }, { status: 500 });
    }
}

function extractName(value: string): string {
  const nameRegex = /^(.*?)\s*<.*>$/;
  const match = value.match(nameRegex);
  if (match) {
    return match[1].trim();
  } else {
    // If the value doesn't match the regex, assume it's just the name
    return value.trim().split('@')[0];
  }
}

function extractEmail(value: string): string {
  const emailRegex = /<(.*?)>/;
  const match = value.match(emailRegex);
  if (match) {
    return match[1].trim();
  } else {
    // If the value doesn't match the regex, assume it's just the email
    return value.trim();
  }
}

function extractDomain(value: string): string {
  const domainRegexFromHeader = /header\.from=([^; ]+)/;
  const matchFromHeader = value.match(domainRegexFromHeader);
  if (matchFromHeader) {
    return matchFromHeader[1].trim();
  }

  const domainRegexIHeader = /header\.i=@([^; ]+)/;
  const matchIHeader = value.match(domainRegexIHeader);
  if (matchIHeader) {
    return matchIHeader[1].trim();
  }

  // If neither regex matches, return 'Unknown'
  return 'Unknown';
}