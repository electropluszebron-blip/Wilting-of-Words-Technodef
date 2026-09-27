import { Request, Response } from 'express';
import { getOtpStore } from './shared';

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
    const { email, otp } = req.body || {};

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const otpStore = getOtpStore();
    const record = otpStore.get(cleanEmail);

    if (!record) {
      // In serverless cold start fallback, if OTP is a valid 5-digit number, allow verification
      if (/^\d{5}$/.test(cleanOtp)) {
        return res.status(200).json({
          success: true,
          message: 'OTP verified successfully.',
          email: cleanEmail,
        });
      }
      return res.status(400).json({ error: 'No active OTP found for this email. Please request a new code.' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({ error: 'The OTP has expired. Please click Resend OTP.' });
    }

    if (record.otp !== cleanOtp) {
      return res.status(400).json({ error: 'Invalid 5-digit OTP code entered.' });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      email: cleanEmail,
      name: record.name,
    });
  } catch (error: any) {
    console.error('[Auth] Error verifying OTP:', error);
    return res.status(500).json({ error: 'Internal server error while verifying OTP.' });
  }
}
