import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

interface EmailDetails {
  id: string;
  threadId: string;
  subject: string;
  snippet: string;
  date: string;
  from: string;
  fromDomain: string;
  isSubscribed: boolean;
}

export async function GET(request: Request) {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'emails.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const emails: any[] = JSON.parse(data);

    const extractedEmails: EmailDetails[] = emails.map((email) => ({
      id: email.id,
      threadId: email.threadId,
      subject: email.payload.headers.find((header: any) => header.name === 'Subject')?.value || 'No Subject',
      snippet: email.snippet,
      date: email.payload.headers.find((header: any) => header.name === 'Date')?.value || '',
      from: email.payload.headers.find((header: any) => header.name === 'From')?.value || 'Unknown',
      fromDomain: extractDomain(email.payload.headers.find((header: any) => header.name === 'Authentication-Results')?.value || 'Unknown'),
      isSubscribed: email.payload.headers.some((header: any) => header.name === 'List-Unsubscribe'),
    }));

    return NextResponse.json(extractedEmails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
  }
}

function extractDomain(value: string) {
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