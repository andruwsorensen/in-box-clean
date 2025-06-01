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
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fromEmail = searchParams.get('fromEmail');
    
    if (!fromEmail) {
      return NextResponse.json({ error: 'fromEmail parameter is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('in-box-clean');
    
    const emails = await db.collection("emails")
      .find({
        userEmail: session.user.email,
        'payload.headers': {
          $elemMatch: {
            name: 'From',
            value: { $regex: fromEmail, $options: 'i' }
          }
        }
      })
      .toArray();

    const extractedEmails: EmailDetails[] = emails.map((email) => ({
      id: email.id,
      threadId: email.threadId,
      subject: email.payload.headers.find((header: { name: string }) => header.name === 'Subject')?.value || 'No Subject',
      snippet: email.snippet,
      date: new Date(email.payload.headers.find((header: { name: string }) => header.name === 'Date')?.value || '').toLocaleString('en-US', { month: 'short', year: 'numeric' }) || '',
      from: email.payload.headers.find((header: { name: string }) => header.name === 'From')?.value || 'Unknown',
      fromName: extractName(email.payload.headers.find((header: { name: string }) => header.name === 'From')?.value || 'Unknown'),
      fromEmail: extractEmail(email.payload.headers.find((header: { name: string }) => header.name === 'From')?.value || 'Unknown'),
      fromDomain: extractDomain(email.payload.headers.find((header: { name: string }) => header.name === 'Authentication-Results')?.value || 'Unknown'),
      isSubscription: email.isSubscription
    }));

    return NextResponse.json(extractedEmails);
  } catch (error) {
    console.error('Error fetching group emails:', error);
    return NextResponse.json({ error: 'Failed to fetch group emails' }, { status: 500 });
  }
}

// Reuse the existing helper functions
function extractName(value: string): string {
  const nameRegex = /^(.*?)\s*<.*>$/;
  const match = value.match(nameRegex);
  if (match) {
    return match[1].trim();
  } else {
    return value.trim().split('@')[0];
  }
}

function extractEmail(value: string): string {
  const emailRegex = /<(.*?)>/;
  const match = value.match(emailRegex);
  if (match) {
    return match[1].trim();
  } else {
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

  return 'Unknown';
}