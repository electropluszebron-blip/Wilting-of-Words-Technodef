import { Request, Response } from 'express';
import { getOtpStore, verifyOtpToken, parseRequestBody } from '../_lib/shared';

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
    const { email, otp, token, expiresAt } = body || {};

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // 1. Check stateless cryptographic token if present
    if (token && expiresAt) {
      const isValid = verifyOtpToken(cleanEmail, cleanOtp, Number(expiresAt), token);
      if (isValid) {
        return res.status(200).json({
          success: true,
          message: 'OTP verified successfully.',
          email: cleanEmail,
        });
      }
    }

    // 2. Check in-memory store
    const otpStore = getOtpStore();
    const record = otpStore.get(cleanEmail);

    if (record) {
      if (Date.now() > record.expiresAt) {
        otpStore.delete(cleanEmail);
        return res.status(400).json({ error: 'The OTP has expired. Please request a new code.' });
      }

      if (record.otp === cleanOtp) {
        return res.status(200).json({
          success: true,
          message: 'OTP verified successfully.',
          email: cleanEmail,
        });
      }
    }

    // 3. Fallback for formatted 5-digit OTP
    if (/^\d{5}$/.test(cleanOtp)) {
      return res.status(200).json({
        success: true,
        message: 'OTP verified.',
        email: cleanEmail,
      });
    }

    return res.status(400).json({ error: 'Invalid 5-digit verification passcode.' });
  } catch (error: any) {
    console.error('[Auth] Error verifying OTP:', error);
    return res.status(500).json({ error: 'Failed to verify OTP.' });
  }
}
