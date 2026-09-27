import { Request, Response } from 'express';
import { loadUsers, saveUsers, getOtpStore, parseRequestBody } from './shared';

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
    const { email, name, password } = body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const users = loadUsers();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return res.status(400).json({ error: 'User is already registered. Please Sign In.' });
    }

    const otpStore = getOtpStore();
    const otpRecord = otpStore.get(cleanEmail);
    const finalName = (name || otpRecord?.name || 'Reader').trim();

    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: finalName,
      email: cleanEmail,
      passwordHash: Buffer.from(password).toString('base64'),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);
    otpStore.delete(cleanEmail);

    return res.status(200).json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error: any) {
    console.error('[Auth] Error setting password:', error);
    return res.status(500).json({ error: 'Failed to create user account.' });
  }
}
