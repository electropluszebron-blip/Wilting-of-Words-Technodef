import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import https from 'https';
import http from 'http';

function pdfProxyPlugin(): Plugin {
  return {
    name: 'pdf-proxy-plugin',
    configureServer(server) {
      server.middlewares.use('/api/pdf', async (req, res) => {
        const fetchPdf = (targetUrl: string, redirectCount = 0) => {
          if (redirectCount > 5) {
            res.statusCode = 500;
            res.end('Too many redirects');
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
              'Cache-Control': 'public, max-age=3600'
            });
            proxyRes.pipe(res);
          }).on('error', (err) => {
            res.statusCode = 500;
            res.end(`Error fetching PDF: ${err.message}`);
          });
        };

        const googleDriveDownloadUrl = 'https://drive.google.com/uc?export=download&id=1avq1PulH3i3avuRI8qrDtSBCF1GQeJUR';
        fetchPdf(googleDriveDownloadUrl);
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), pdfProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
