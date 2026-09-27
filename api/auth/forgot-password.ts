import { Request, Response } from 'express';
import { 
  getOtpStore, 
  loadUsers, 
  transporter, 
  generateAuthEmailHtml,
  createOtpToken,
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
    const { email } = body || {};

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const users = loadUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);
    const recipientName = existingUser ? existingUser.name : 'Reader';

    // Generate random 5-digit OTP
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Create verification token for stateless edge invocations
    const token = createOtpToken(cleanEmail, otp, expiresAt);

    const otpStore = getOtpStore();
    otpStore.set(cleanEmail, {
      otp,
      token,
      name: recipientName,
      type: 'reset',
      expiresAt,
    });

    const mailHtml = generateAuthEmailHtml(recipientName, otp, 'reset');

    const mailOptions = {
      from: '"Wilting of Words | Technodef" <technodef.admin@gmail.com>',
      to: cleanEmail,
      subject: `Password Reset Passcode: ${otp} | Wilting of Words`,
      html: mailHtml,
    };

    await transporter.sendMail(mailOptions);

    console.log(`[Auth] Password Reset OTP dispatched to ${cleanEmail}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: `A 5-digit password reset code has been sent to ${cleanEmail}.`,
      expiresInMinutes: 10,
      token,
      expiresAt,
    });
  } catch (error: any) {
    console.error('[Auth] Error sending reset OTP:', error);
    return res.status(500).json({
      error: 'Failed to send password reset code. Please check your email address.',
      details: error.message,
    });
  }
}
