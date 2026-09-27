import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Persistent storage for registered readers
const DATA_DIR = path.resolve(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Plain/Base64 or secure representation
  createdAt: string;
}

function loadUsers(): StoredUser[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading users file:', e);
  }
  return [];
}

function saveUsers(users: StoredUser[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving users file:', e);
  }
}

// In-memory store for 5-digit verification OTPs with 10-minute expiry
interface OtpEntry {
  otp: string;
  name: string;
  expiresAt: number;
}
const otpStore = new Map<string, OtpEntry>();

// Gmail SMTP Transporter using provided technodef.admin@gmail.com credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'technodef.admin@gmail.com',
    pass: 'frwoyyjicslyxmgn', // Provided App Password
  },
});

// HTML Email Generator matching Screenshot_20260925_213627_Gmail.jpg
function generateAuthEmailHtml(name: string, otp: string): string {
  const formattedOtp = otp.split('').join(' ');
  const recipientName = name ? name.trim() : 'Reader';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wilting of Words - Reader Authentication</title>
</head>
<body style="margin: 0; padding: 24px 10px; background-color: #f7f3ec; font-family: 'Georgia', serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; margin: 0 auto; background-color: #fcf9f2; border-left: 2px solid #8B261D; border-right: 2px solid #8B261D; border-top: 4px solid #8B261D; border-bottom: 4px solid #8B261D; box-shadow: 0 10px 35px rgba(139, 38, 29, 0.08);">
    <tr>
      <td style="padding: 36px 28px; text-align: center;">
        
        <!-- Alpona Floral Motif -->
        <div style="font-size: 20px; line-height: 1; color: #8B261D; margin-bottom: 8px;">
          ❦ &nbsp; ✤ &nbsp; ❦
        </div>

        <!-- Master Title -->
        <h1 style="margin: 4px 0 6px 0; font-family: 'Cinzel', Georgia, serif; font-size: 26px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #6B1D1D; line-height: 1.2;">
          WILTING OF WORDS
        </h1>

        <!-- Portal Subtitle -->
        <div style="font-family: 'Cinzel', Georgia, serif; font-size: 11px; letter-spacing: 0.24em; text-transform: uppercase; font-weight: 700; color: #8C6F48; margin-bottom: 14px;">
          TECHNODEF AUTOMATED READER PORTAL
        </div>

        <!-- Decorative Floral Divider -->
        <div style="color: #C89B4C; font-size: 14px; letter-spacing: 0.2em; margin-bottom: 22px;">
          ❖ ─── ❀ ─── ❖
        </div>

        <!-- Poetic Bengali Epigraph & English Rendering -->
        <div style="margin-bottom: 26px;">
          <p style="margin: 0 0 6px 0; font-family: 'Georgia', serif; font-style: italic; font-size: 14.5px; color: #6B1D1D; line-height: 1.6;">
            "ঝরা পাতার মতো শব্দগুলো যদি ঝরে যায়, স্মৃতিটুকু বেঁচে থাকে অক্ষরের বাঁধনে..."
          </p>
          <p style="margin: 0; font-family: 'Georgia', serif; font-style: italic; font-size: 12px; color: #7A5B3E; line-height: 1.5;">
            — Even as words wilt like autumn foliage, their essence endures within the bond of print.
          </p>
        </div>

        <!-- Reader Salutation & Welcome -->
        <div style="text-align: left; margin-bottom: 24px;">
          <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #2D241E;">
            Respected ${recipientName},
          </p>
          <p style="margin: 0; font-size: 13.5px; line-height: 1.75; color: #3E3228;">
            Welcome to the sanctuary of timeless letters. To confirm your identity, grant access to your exclusive manuscript collection, and establish your secret passphrase for <strong>Wilting of Words</strong>, please use the sacred authentication cipher provided below:
          </p>
        </div>

        <!-- Sacred Passcode Box -->
        <div style="background-color: #F8EFE1; border: 1.5px solid #8B261D; border-radius: 6px; padding: 20px 24px; margin: 26px auto; max-width: 330px; text-align: center; box-shadow: inset 0 0 12px rgba(139, 38, 29, 0.05);">
          <div style="font-family: Georgia, serif; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: #8A6740; margin-bottom: 8px;">
            SECURITY ACCESS PASSCODE
          </div>
          <div style="font-family: 'Courier New', Courier, monospace, Georgia; font-size: 38px; font-weight: 800; letter-spacing: 0.35em; color: #6B1D1D; line-height: 1.1; padding: 4px 0; text-indent: 0.35em;">
            ${formattedOtp}
          </div>
          <div style="font-family: Georgia, serif; font-size: 9.5px; letter-spacing: 0.2em; text-transform: uppercase; color: #8A6740; margin-top: 8px;">
            SINGLE-USE VERIFICATION CODE
          </div>
        </div>

        <!-- Chronometer Notice Box -->
        <div style="background-color: #F7EEDE; border-left: 3.5px solid #8B261D; padding: 12px 16px; margin: 24px 0; text-align: left; font-size: 11.5px; line-height: 1.6; color: #4A3B2C;">
          <strong style="color: #6B1D1D;">Chronometer Notice:</strong> This access token remains valid for strictly <strong>10 minutes</strong>. It is mandatory for verifying your reader identity and setting your new password. Should this window lapse, a new token must be summoned from the portal.
        </div>

        <!-- Security Disclaimer -->
        <p style="text-align: left; font-size: 12.5px; line-height: 1.65; color: #5C4B3D; margin: 0 0 24px 0;">
          If you have not solicited access to <em>Wilting of Words</em>, please discard this epistle; your parchment and account remain inviolable and unperturbed.
        </p>

        <!-- Technodef Formal Sign-off -->
        <div style="text-align: left; font-size: 13px; line-height: 1.5; padding-top: 10px; border-top: 1px dashed #D6C2A5;">
          <div style="font-style: italic; color: #7A5B3E; margin-bottom: 4px;">
            In devotion to the written word,
          </div>
          <div style="font-weight: 700; color: #6B1D1D; font-size: 13.5px;">
            Technodef Literary Archives &nbsp; <span style="font-size: 16px;">🖋️</span>
          </div>
        </div>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// API Routes
// 1. Send OTP
app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

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

    console.log(`[Auth] 5-digit OTP sent to ${cleanEmail}: ${otp}`);

    return res.json({
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
});

// 2. Verify OTP
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const record = otpStore.get(cleanEmail);

    if (!record) {
      return res.status(400).json({ error: 'No active OTP found for this email. Please request a new code.' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({ error: 'The OTP has expired. Please click Resend OTP.' });
    }

    if (record.otp !== cleanOtp) {
      return res.status(400).json({ error: 'Invalid OTP. Please enter the correct 5-digit code sent to your email.' });
    }

    return res.json({
      success: true,
      message: 'OTP verified successfully.',
      name: record.name,
      email: cleanEmail,
    });
  } catch (error: any) {
    console.error('[Auth] Error verifying OTP:', error);
    return res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

// 3. Set Password & Finalize Account Creation
app.post('/api/auth/set-password', (req: Request, res: Response) => {
  try {
    const { email, otp, password, name } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ error: 'Missing required credentials.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const record = otpStore.get(cleanEmail);
    if (!record || record.otp !== cleanOtp) {
      return res.status(400).json({ error: 'Invalid or expired cipher session. Please restart registration.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Passphrase must be at least 6 characters in length.' });
    }

    const users = loadUsers();
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);

    const userName = name || record.name || 'Respected Reader';

    if (existingIndex >= 0) {
      users[existingIndex].passwordHash = Buffer.from(password).toString('base64');
      users[existingIndex].name = userName;
    } else {
      users.push({
        id: 'reader_' + Date.now(),
        name: userName,
        email: cleanEmail,
        passwordHash: Buffer.from(password).toString('base64'),
        createdAt: new Date().toISOString(),
      });
    }

    saveUsers(users);
    otpStore.delete(cleanEmail); // Clear single-use OTP

    console.log(`[Auth] Reader registered successfully: ${cleanEmail} (${userName})`);

    return res.json({
      success: true,
      message: 'Your reader identity and passphrase have been sealed into the archives.',
      user: {
        name: userName,
        email: cleanEmail,
      },
    });
  } catch (error: any) {
    console.error('[Auth] Error setting password:', error);
    return res.status(500).json({ error: 'Failed to seal passphrase. Please try again.' });
  }
});

// 4. Sign In
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and passphrase are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const users = loadUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return res.status(401).json({ error: 'No registered reader found with this email. Please sign up.' });
    }

    const expectedHash = Buffer.from(password).toString('base64');
    if (user.passwordHash !== expectedHash) {
      return res.status(401).json({ error: 'Invalid passphrase. Please verify your credentials.' });
    }

    console.log(`[Auth] Reader authenticated: ${cleanEmail}`);

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('[Auth] Error during login:', error);
    return res.status(500).json({ error: 'Authentication service encountered an issue.' });
  }
});

// 5. PDF Proxy route
app.get('/api/pdf', async (req: Request, res: Response) => {
  const fetchPdf = (targetUrl: string, redirectCount = 0) => {
    if (redirectCount > 5) {
      res.status(500).send('Too many redirects');
      return;
    }

    const client = targetUrl.startsWith('https') ? https : http;
    client.get(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (proxyRes) => {
      if (proxyRes.statusCode && proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
        fetchPdf(proxyRes.headers.location, redirectCount + 1);
        return;
      }

      res.writeHead(proxyRes.statusCode || 200, {
        'Content-Type': 'application/pdf',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      });
      proxyRes.pipe(res);
    }).on('error', (err) => {
      res.status(500).send(`Error fetching PDF: ${err.message}`);
    });
  };

  const googleDriveDownloadUrl = 'https://drive.google.com/uc?export=download&id=1avq1PulH3i3avuRI8qrDtSBCF1GQeJUR';
  fetchPdf(googleDriveDownloadUrl);
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  if (!process.env.VERCEL) {
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`[Server] Wilting of Words portal running on http://0.0.0.0:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
