import http from 'http';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { env } from '../src/config/env.js';

const CLIENT_ID = env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
const PORT = 5000;
const REDIRECT_URI = `http://localhost:${PORT}/api/uploads/gdrive-callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Please make sure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are in backend/.env');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/drive'],
});

console.log('\n===============================================================');
console.log('1. Click or open this link in your browser:');
console.log('===============================================================\n');
console.log(authUrl);
console.log('\n===============================================================');
console.log('2. Sign in with testedfiles8@gmail.com and click "Allow".');
console.log('3. Waiting for authorization code on http://localhost:5000/api/uploads/gdrive-callback ...\n');
