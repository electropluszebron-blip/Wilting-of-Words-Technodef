import { Request, Response } from 'express';
import { loadUsers, parseRequestBody } from '../_lib/shared';

export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = await parseRequestBody(req);
    const { email, password } = body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const users = loadUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return res.status(401).json({ error: 'Account not found. Please Sign Up.' });
    }

    const inputHash = Buffer.from(password).toString('base64');
    if (user.passwordHash !== inputHash && user.passwordHash !== password) {
      return res.status(401).json({ error: 'Incorrect passphrase. Access denied.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('[Auth] Error signing in:', error);
    return res.status(500).json({ error: 'Failed to sign in.' });
  }
}
