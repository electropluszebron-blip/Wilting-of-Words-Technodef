import nodemailer from 'nodemailer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

// Secret for OTP verification tokens (stateless across Vercel serverless lambdas)
const OTP_SECRET = process.env.AUTH_SECRET || 'wilting-words-sacred-key-2026';

export function createOtpToken(email: string, otp: string, expiresAt: number): string {
  const cleanEmail = email.toLowerCase().trim();
  const data = `${cleanEmail}:${otp}:${expiresAt}`;
  return crypto.createHmac('sha256', OTP_SECRET).update(data).digest('hex');
}

export function verifyOtpToken(email: string, otp: string, expiresAt: number, token: string): boolean {
  if (Date.now() > expiresAt) return false;
  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = otp.toString().trim();
  const expected = createOtpToken(cleanEmail, cleanOtp, expiresAt);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}

// Client-safe hash verification for fallback
export async function clientSha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.webcrypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Storage directory
const DATA_DIR = process.env.VERCEL ? '/tmp' : path.resolve(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // read-only env
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

let inMemoryUsers: StoredUser[] = [];

export function loadUsers(): StoredUser[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('[Storage] Fallback to memory:', e);
  }
  return inMemoryUsers;
}

export function saveUsers(users: StoredUser[]) {
  inMemoryUsers = users;
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[Storage] Error writing file:', e);
  }
}

export interface OtpEntry {
  otp: string;
  token?: string;
  name?: string;
  type?: 'signup' | 'reset';
  expiresAt: number;
}

// Global in-memory OTP store across warm invocations
const globalOtpStore = new Map<string, OtpEntry>();

export function getOtpStore(): Map<string, OtpEntry> {
  return globalOtpStore;
}

// Helper to safely parse JSON body across Express, Vercel Serverless, and standard IncomingMessage
export async function parseRequestBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk: any) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => {
      resolve({});
    });
  });
}

// Gmail App Password
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD || 'frwoyyjicslyxmgn';

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'technodef.admin@gmail.com',
    pass: GMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

export function generateAuthEmailHtml(name: string, otp: string, type: 'signup' | 'reset' = 'signup'): string {
  const formattedOtp = otp.split('').join(' ');
  const recipientName = name ? name.trim() : 'Reader';
  const isReset = type === 'reset';

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
            ${
              isReset
                ? 'We received a request to reset your sanctuary passphrase for <strong>Wilting of Words</strong>. Please use the single-use passcode below to authorize this reset:'
                : 'Welcome to the sanctuary of timeless letters. To confirm your identity, grant access to your exclusive manuscript collection, and establish your secret passphrase for <strong>Wilting of Words</strong>, please use the sacred authentication cipher provided below:'
            }
          </p>
        </div>

        <!-- Sacred Passcode Box -->
        <div style="background-color: #F8EFE1; border: 1.5px solid #8B261D; border-radius: 6px; padding: 20px 24px; margin: 26px auto; max-width: 330px; text-align: center; box-shadow: inset 0 0 12px rgba(139, 38, 29, 0.05);">
          <div style="font-family: Georgia, serif; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: #8A6740; margin-bottom: 8px;">
            ${isReset ? 'PASSWORD RESET PASSCODE' : 'SECURITY ACCESS PASSCODE'}
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
          <strong style="color: #6B1D1D;">Chronometer Notice:</strong> This access token remains valid for strictly <strong>10 minutes</strong>. It is mandatory for verifying your reader identity. Should this window lapse, a new token must be summoned from the portal.
        </div>

        <!-- Security Disclaimer -->
        <p style="text-align: left; font-size: 12.5px; line-height: 1.65; color: #5C4B3D; margin: 0 0 24px 0;">
          If you have not solicited access or a password reset for <em>Wilting of Words</em>, please discard this epistle; your parchment and account remain inviolable and unperturbed.
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
