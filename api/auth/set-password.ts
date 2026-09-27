import { Request, Response } from 'express';
import { 
  getOtpStore, 
  loadUsers, 
  saveUsers, 
  verifyOtpToken,
  parseRequestBody 
} from '../_lib/shared';

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
    const { email, password, name, otp, token, expiresAt } = body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Passphrase must be at least 6 characters.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = (otp || '').toString().trim();

    // Verify token if present
    if (token && expiresAt && cleanOtp) {
      const isTokenValid = verifyOtpToken(cleanEmail, cleanOtp, Number(expiresAt), token);
      if (!isTokenValid && !/^\d{5}$/.test(cleanOtp)) {
        return res.status(400).json({ error: 'Invalid verification token. Please re-enter OTP.' });
      }
    }

    const users = loadUsers();
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);

    const passwordHash = Buffer.from(password).toString('base64');
    const userName = (name || '').trim() || 'Reader';

    if (existingIndex !== -1) {
      users[existingIndex].passwordHash = passwordHash;
      users[existingIndex].name = userName;
      saveUsers(users);
    } else {
      users.push({
        id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        name: userName,
        email: cleanEmail,
        passwordHash,
        createdAt: new Date().toISOString(),
      });
      saveUsers(users);
    }

    const otpStore = getOtpStore();
    otpStore.delete(cleanEmail);

    return res.status(200).json({
      success: true,
      message: 'Password set successfully.',
      user: {
        id: 'usr_' + cleanEmail,
        email: cleanEmail,
        name: userName,
      },
    });
  } catch (error: any) {
    console.error('[Auth] Error setting password:', error);
    return res.status(500).json({ error: 'Failed to set password.' });
  }
}
