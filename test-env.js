#!/usr/bin/env node

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Environment Variable Test\n');

console.log('Raw environment variables:');
console.log('GMAIL_CLIENT_ID:', process.env.GMAIL_CLIENT_ID);
console.log('GMAIL_CLIENT_SECRET:', process.env.GMAIL_CLIENT_SECRET ? '[PRESENT]' : '[MISSING]');
console.log('GMAIL_REFRESH_TOKEN:', process.env.GMAIL_REFRESH_TOKEN);
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

console.log('\nChecking for placeholder values:');
if (process.env.GMAIL_CLIENT_ID === 'your_google_oauth_client_id') {
  console.log('❌ GMAIL_CLIENT_ID is still placeholder');
} else if (process.env.GMAIL_CLIENT_ID) {
  console.log('✅ GMAIL_CLIENT_ID has real value');
} else {
  console.log('❌ GMAIL_CLIENT_ID is missing');
}

if (process.env.GMAIL_REFRESH_TOKEN === 'your_refresh_token_here') {
  console.log('❌ GMAIL_REFRESH_TOKEN is still placeholder');
} else if (process.env.GMAIL_REFRESH_TOKEN) {
  console.log('✅ GMAIL_REFRESH_TOKEN has real value');
} else {
  console.log('❌ GMAIL_REFRESH_TOKEN is missing');
}