import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import sendOtpHandler from './api/auth/send-otp';
import verifyOtpHandler from './api/auth/verify-otp';
import setPasswordHandler from './api/auth/set-password';
import forgotPasswordHandler from './api/auth/forgot-password';
import resetPasswordHandler from './api/auth/reset-password';
import signinHandler from './api/auth/signin';
import pdfHandler from './api/pdf';

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// API Routes mapped directly to serverless handlers
app.all('/api/auth/send-otp', (req: Request, res: Response) => sendOtpHandler(req, res));
app.all('/api/auth/verify-otp', (req: Request, res: Response) => verifyOtpHandler(req, res));
app.all('/api/auth/set-password', (req: Request, res: Response) => setPasswordHandler(req, res));
app.all('/api/auth/forgot-password', (req: Request, res: Response) => forgotPasswordHandler(req, res));
app.all('/api/auth/reset-password', (req: Request, res: Response) => resetPasswordHandler(req, res));
app.all('/api/auth/signin', (req: Request, res: Response) => signinHandler(req, res));
app.all('/api/auth/login', (req: Request, res: Response) => signinHandler(req, res));
app.all('/api/pdf', (req: Request, res: Response) => pdfHandler(req, res));

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
