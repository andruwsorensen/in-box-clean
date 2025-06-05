import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { auth } from '@/auth';

interface EmailGroup {
  fromEmail: string;
  fromName: string;
  fromDomain: string;
  emailCount: number;
  latestEmailDate: string;
  from: string;
}

export async function GET(request: Request) {
  try {
    // Do something with request
    console.log(request);
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('in-box-clean');
    
    const emails = await db.collection("emails")
      .find({ userEmail: session.user.email })
      .toArray();

    // Create a map to group emails
    const groupMap = new Map<string, EmailGroup>();

    emails.forEach(email => {
      const fromHeader = email.payload.headers.find((header: { name: string }) => header.name === 'From')?.value || 'Unknown';
      const dateHeader = email.payload.headers.find((header: { name: string }) => header.name === 'Date')?.value;
      const authHeader = email.payload.headers.find((header: { name: string }) => header.name === 'Authentication-Results')?.value;

      const fromEmail = extractEmail(fromHeader);
      
      if (!groupMap.has(fromEmail)) {
        groupMap.set(fromEmail, {
          fromEmail,
          fromName: extractName(fromHeader),
          fromDomain: extractDomain(authHeader || 'Unknown'),
          emailCount: 0,
          latestEmailDate: dateHeader || '',
          from: fromHeader
        });
      }

      const group = groupMap.get(fromEmail)!;
      group.emailCount++;
      
      // Update latest date if newer
      if (dateHeader && (!group.latestEmailDate || new Date(dateHeader) > new Date(group.latestEmailDate))) {
        group.latestEmailDate = dateHeader;
      }
    });

    // Convert map to array and sort by count
    const emailGroups = Array.from(groupMap.values())
      .sort((a, b) => b.emailCount - a.emailCount);

    return NextResponse.json(emailGroups);
  } catch (error) {
    console.error('Error fetching email groups:', error);
    return NextResponse.json({ error: 'Failed to fetch email groups' }, { status: 500 });
  }
}

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