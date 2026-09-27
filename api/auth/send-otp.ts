import { Request, Response } from 'express';
import { 
  getOtpStore, 
  loadUsers, 
  transporter, 
  generateAuthEmailHtml 
} from './shared';

export default async function handler(req: Request, res: Response) {
  // Support CORS
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
    const { name, email } = req.body || {};

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = (name || '').trim();

    // Check if user already registered
    const existingUsers = loadUsers();
    const userExists = existingUsers.some(u => u.email.toLowerCase() === cleanEmail);

    if (userExists) {
      return res.status(400).json({
        error: 'An account with this email address already exists. Please Sign In.',
        alreadyRegistered: true,
      });
    }

    // Generate random 5-digit OTP
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    const otpStore = getOtpStore();
    otpStore.set(cleanEmail, {
      otp,
      name: cleanName,
      expiresAt,
    });

    const mailHtml = generateAuthEmailHtml(cleanName, otp);

    const mailOptions = {
      from: '"Wilting of Words | Technodef" <technodef.admin@gmail.com>',
      to: cleanEmail,
      subject: `Your Authentication Cipher: ${otp} | Wilting of Words`,
      html: mailHtml,
    };

    await transporter.sendMail(mailOptions);

    console.log(`[Auth] 5-digit OTP dispatched to ${cleanEmail}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: `A 5-digit verification OTP has been dispatched to ${cleanEmail}.`,
      expiresInMinutes: 10,
      userExists,
    });
  } catch (error: any) {
    console.error('[Auth] Error sending OTP:', error);
    return res.status(500).json({
      error: 'Failed to send OTP to your email. Please verify your email address.',
      details: error.message,
    });
  }
}
