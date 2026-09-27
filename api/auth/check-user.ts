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

  try {
    const body = req.method === 'POST' ? await parseRequestBody(req) : req.query;
    const email = (body.email || req.query.email || '') as string;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required', exists: false });
    }

    const cleanEmail = email.toLowerCase().trim();
    const users = loadUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);

    return res.status(200).json({
      success: true,
      exists: !!existingUser,
      name: existingUser?.name || null,
      email: cleanEmail,
    });
  } catch (error: any) {
    console.error('[Auth] Error checking user existence:', error);
    return res.status(500).json({ error: 'Server error checking user', exists: false });
  }
}
