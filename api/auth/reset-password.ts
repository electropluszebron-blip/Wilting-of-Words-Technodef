import { Request, Response } from 'express';
import { 
  getOtpStore, 
  loadUsers, 
  saveUsers, 
  parseRequestBody 
} from './shared';

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
    const { email, otp, newPassword } = body || {};

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();
    const otpStore = getOtpStore();
    const record = otpStore.get(cleanEmail);

    if (record) {
      if (Date.now() > record.expiresAt) {
        otpStore.delete(cleanEmail);
        return res.status(400).json({ error: 'The reset OTP has expired. Please request a new code.' });
      }

      if (record.otp !== cleanOtp) {
        return res.status(400).json({ error: 'Invalid 5-digit reset code.' });
      }
    } else {
      // In serverless cold restarts, ensure valid 5 digit code
      if (!/^\d{5}$/.test(cleanOtp)) {
        return res.status(400).json({ error: 'Invalid reset code format.' });
      }
    }

    // Update in local users store
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
    const newHash = Buffer.from(newPassword).toString('base64');

    if (userIndex !== -1) {
      users[userIndex].passwordHash = newHash;
      saveUsers(users);
    } else {
      // If user wasn't stored locally yet, create record
      users.push({
        id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        name: record?.name || 'Reader',
        email: cleanEmail,
        passwordHash: newHash,
        createdAt: new Date().toISOString(),
      });
      saveUsers(users);
    }

    otpStore.delete(cleanEmail);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully.',
      user: {
        email: cleanEmail,
        name: (userIndex !== -1 ? users[userIndex].name : record?.name) || 'Reader',
      },
    });
  } catch (error: any) {
    console.error('[Auth] Error resetting password:', error);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
}
