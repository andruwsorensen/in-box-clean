import { kv } from '@vercel/kv';

interface Credentials {
  web: {
    client_id: string;
    project_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_secret: string;
    redirect_uris: string[];
    javascript_origins: string[];
  };
}

interface Stats {
  unsubscribed: number;
  deleted: number;
}

interface Token {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export function getCredentials(): Credentials {
  const credentialsString = process.env.GOOGLE_CREDENTIALS;
  if (!credentialsString) {
    throw new Error('GOOGLE_CREDENTIALS environment variable is not set');
  }
  return JSON.parse(credentialsString) as Credentials;
}

export async function getStats(): Promise<Stats> {
  const stats = await kv.get<Stats>('stats');
  return stats || { unsubscribed: 0, deleted: 0 };
}

export async function setStats(stats: Stats): Promise<void> {
  await kv.set('stats', stats);
}

export async function getToken(): Promise<Token | null> {
  return await kv.get<Token>('token');
}

export async function setToken(token: Token): Promise<void> {
  await kv.set('token', token);
}

export async function getEmails(): Promise<string[]> {
  return await kv.get<string[]>('emails') || [];
}

export async function setEmails(emails: string[]): Promise<void> {
  await kv.set('emails', emails);
}