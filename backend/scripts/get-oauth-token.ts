/**
 * 🔑 One-time OAuth2 Token Fetcher for Personal Google Drive
 * 
 * Run this script ONCE to get a refresh_token for your personal Gmail account.
 * This is required because service accounts have 0 MB quota on personal Gmail Drive.
 * 
 * Usage:
 *   cd backend
 *   npx tsx scripts/get-oauth-token.ts
 * 
 * Then open the URL it prints in your browser, sign in with testedfiles8@gmail.com,
 * and authorize. The script will capture the refresh token and save it to .env automatically.
 */

import http from 'http';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import dotenv from 'dotenv';

// Load .env from the backend directory
const envPath = path.resolve(process.cwd(), '.env');
// Also try parent if running from project root
const envPathAlt = path.resolve(process.cwd(), 'backend', '.env');
const actualEnvPath = fs.existsSync(envPath) ? envPath : fs.existsSync(envPathAlt) ? envPathAlt : envPath;
dotenv.config({ path: actualEnvPath });

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in backend/.env');
  console.error('   Get these from: https://console.cloud.google.com/apis/credentials');
  process.exit(1);
}

const PORT = 9999;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent', // Force consent to get refresh_token
  scope: ['https://www.googleapis.com/auth/drive'],
});

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  🔑 Google Drive OAuth2 Token Fetcher');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
console.log('  📋 IMPORTANT: First, go to Google Cloud Console and add this');
console.log('     redirect URI to your OAuth Client:');
console.log('');
console.log(`     ${REDIRECT_URI}`);
console.log('');
console.log('     Google Cloud Console → APIs & Services → Credentials');
console.log('     → Click your OAuth Client ID → Authorized redirect URIs');
console.log('     → Add URI → Save');
console.log('');
console.log('  Also make sure testedfiles8@gmail.com is added as a');
console.log('  Test User in OAuth consent screen settings.');
console.log('');
console.log('  Then open this URL in your browser:');
console.log('');
console.log(`  👉 ${authUrl}`);
console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  Waiting for authorization...');
console.log('');

const server = http.createServer(async (req, res) => {
  if (!req.url?.startsWith('/callback')) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    console.error(`❌ Authorization error: ${error}`);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<html><body style="font-family:sans-serif;background:#1e293b;color:#f87171;text-align:center;padding:60px">
      <h1>❌ Authorization Failed</h1><p>${error}</p>
      <p>Close this tab and try again.</p></body></html>`);
    setTimeout(() => process.exit(1), 1000);
    return;
  }

  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end('<html><body>No code received</body></html>');
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('✅ Authorization successful!');
    console.log('');

    if (tokens.refresh_token) {
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('  🎉 REFRESH TOKEN OBTAINED:');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log(`  ${tokens.refresh_token}`);
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('');

      // Auto-save to .env
      let content = fs.existsSync(actualEnvPath) ? fs.readFileSync(actualEnvPath, 'utf8') : '';
      if (content.includes('GOOGLE_REFRESH_TOKEN=')) {
        content = content.replace(/GOOGLE_REFRESH_TOKEN=.*/, `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
      } else {
        content += `\nGOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`;
      }
      fs.writeFileSync(actualEnvPath, content);
      console.log(`  ✅ Saved to ${actualEnvPath}`);
      console.log('');
      console.log('  🚀 Now restart your backend server and uploads will go to Google Drive!');
      console.log('');
    } else {
      console.log('⚠️  No refresh_token in response. This can happen if:');
      console.log('    - You previously authorized this app (revoke at https://myaccount.google.com/permissions)');
      console.log('    - Re-run this script after revoking');
      console.log('');
      if (tokens.access_token) {
        console.log('  Access token received (temporary):', tokens.access_token.substring(0, 30) + '...');
      }
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<html><body style="font-family:sans-serif;background:#0f172a;color:#4ade80;text-align:center;padding:60px">
      <h1>✅ Google Drive Connected!</h1>
      <p style="color:#94a3b8">Refresh token saved to backend/.env</p>
      <p style="color:#94a3b8">You can close this tab and restart your backend server.</p>
      <p style="color:#facc15;margin-top:40px">🚀 Uploads will now go directly to your personal Google Drive!</p>
    </body></html>`);
  } catch (err: any) {
    console.error('❌ Token exchange failed:', err?.message);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`<html><body style="font-family:sans-serif;background:#1e293b;color:#f87171;text-align:center;padding:60px">
      <h1>❌ Token Exchange Failed</h1><p>${err?.message}</p></body></html>`);
  }

  setTimeout(() => {
    server.close();
    process.exit(0);
  }, 2000);
});

server.listen(PORT, () => {
  console.log(`  Local callback server listening on port ${PORT}...`);
});
