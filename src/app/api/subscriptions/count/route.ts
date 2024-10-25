import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db('in-box-clean');
  const emails = await db.collection("emails")
    .find({ sessionId: session.access_token })
    .toArray();
  const result = {
    count: emails.length
  }

  return NextResponse.json(result);
}