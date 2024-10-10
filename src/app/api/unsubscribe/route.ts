import { NextResponse } from 'next/server';
import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';
import { google, gmail_v1 } from 'googleapis';
import { getOAuth2Client } from '../utils/auth';

const gmail = google.gmail('v1');

async function createBlockFilter(auth: any, gmail: gmail_v1.Gmail, sender: string) {
    try {
      const filter = {
        criteria: {
          from: sender,
        },
        action: {
          addLabelIds: ['TRASH'],
          removeLabelIds: ['INBOX'],
        },
      };
  
      await gmail.users.settings.filters.create({
        userId: 'me',
        requestBody: filter,
        auth,
      });
  
      console.log(`Created filter to block emails from ${sender}`);
    } catch (error) {
      console.error(`Failed to create filter for ${sender}:`, error);
    }
  }

export async function POST(request: Request) {
  const { email, emailContent } = await request.json();

  // 1. Check for unsubscribe link in headers
  const parsedEmail = await simpleParser(emailContent);
  const unsubscribeHeader = parsedEmail.headers.get('list-unsubscribe');
  if (unsubscribeHeader) {
    const unsubscribeUrl = unsubscribeHeader.split(',')[0].replace('<', '').replace('>', '');
    if (unsubscribeUrl.startsWith('http')) {
      // Perform HTTP request to unsubscribe
      const response = await fetch(unsubscribeUrl, { method: 'GET' });
      if (response.ok) {
        console.log('Unsubscribed via header link');
        return NextResponse.json({ success: true, method: 'header_link' });
      }
    }
  }

  // 2. Search for unsubscribe link in email body
  const bodyText = parsedEmail.text || '';
  const unsubscribeRegex = /https?:\/\/[^\s]+unsubscribe[^\s]*/i;
  const bodyUnsubscribeMatch = bodyText.match(unsubscribeRegex);
  if (bodyUnsubscribeMatch) {
    const unsubscribeUrl = bodyUnsubscribeMatch[0];
    const response = await fetch(unsubscribeUrl, { method: 'GET' });
    if (response.ok) {
      console.log('Unsubscribed via body link');
      return NextResponse.json({ success: true, method: 'body_link' });
    }
  }

  // 3. Check for mailto: unsubscribe
  if (unsubscribeHeader && typeof unsubscribeHeader === 'string' && unsubscribeHeader.includes('mailto:')) {
    const mailtoAddress = unsubscribeHeader.split('mailto:')[1].split('>')[0];
    // Send unsubscribe email
    const transporter = nodemailer.createTransport({
      // Configure your email service here
    });

    await transporter.sendMail({
      from: email,
      to: mailtoAddress,
      subject: 'Unsubscribe',
      text: 'Please unsubscribe me from this mailing list.',
    });

    console.log('Unsubscribed via mailto');
    return NextResponse.json({ success: true, method: 'mailto' });
  }

  // 4. If all else fails, just block the email
  const auth = await getOAuth2Client();
  await createBlockFilter(auth, gmail, email);
  console.log('Blocking email');
  return NextResponse.json({ success: true, method: 'block' });
}