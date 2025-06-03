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
  const count = await db.collection("count")
    .findOne({ access_token: session.access_token });

  // console.log('Count: ', count?.count);
  if (!count) {
    return NextResponse.json({ count: 0 });
  }

  return NextResponse.json({ count: count.count });
}