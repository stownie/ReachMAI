#!/usr/bin/env node

import { google } from 'googleapis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testOAuth2() {
  console.log('🔍 Testing OAuth2 Configuration...\n');
  
  // Check environment variables
  const {
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    GMAIL_REFRESH_TOKEN,
    EMAIL_FROM
  } = process.env;

  console.log('📋 Environment Variables:');
  console.log(`GMAIL_CLIENT_ID: ${GMAIL_CLIENT_ID ? GMAIL_CLIENT_ID.substring(0, 20) + '...' : '❌ Missing'}`);
  console.log(`GMAIL_CLIENT_SECRET: ${GMAIL_CLIENT_SECRET ? '✅ Present (hidden)' : '❌ Missing'}`);
  console.log(`GMAIL_REFRESH_TOKEN: ${GMAIL_REFRESH_TOKEN ? GMAIL_REFRESH_TOKEN.substring(0, 20) + '...' : '❌ Missing'}`);
  console.log(`EMAIL_FROM: ${EMAIL_FROM || '❌ Missing'}\n`);

  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN || !EMAIL_FROM) {
    console.log('❌ Missing required environment variables. Please check your .env file.');
    return;
  }

  try {
    // Create OAuth2 client
    console.log('🔑 Creating OAuth2 client...');
    const oauth2Client = new google.auth.OAuth2(
      GMAIL_CLIENT_ID,
      GMAIL_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    // Set credentials
    console.log('🎫 Setting refresh token...');
    oauth2Client.setCredentials({
      refresh_token: GMAIL_REFRESH_TOKEN,
    });

    // Try to get access token
    console.log('🔄 Attempting to refresh access token...');
    const accessTokenResponse = await oauth2Client.getAccessToken();

    if (accessTokenResponse.token) {
      console.log('✅ SUCCESS! Access token generated successfully.');
      console.log(`🎟️  Access token: ${accessTokenResponse.token.substring(0, 30)}...`);
      console.log('\n🎉 Your OAuth2 configuration is working correctly!');
      console.log('📧 Email service should now work properly.');
    } else {
      console.log('❌ Failed to generate access token');
    }

  } catch (error) {
    console.log('❌ OAuth2 Error:', error.message);
    
    if (error.message.includes('invalid_client')) {
      console.log('\n🔧 Troubleshooting Steps:');
      console.log('1. Check that your GMAIL_CLIENT_ID is correct');
      console.log('2. Check that your GMAIL_CLIENT_SECRET is correct');
      console.log('3. Verify your Google Cloud Console OAuth2 client configuration');
      console.log('4. Make sure the OAuth2 client has Gmail API access enabled');
    } else if (error.message.includes('invalid_grant')) {
      console.log('\n🔧 Troubleshooting Steps:');
      console.log('1. Your refresh token may have expired');
      console.log('2. Re-generate your refresh token using OAuth2 Playground');
      console.log('3. Make sure the refresh token matches the same OAuth2 client');
    }
    
    console.log('\nFull error details:');
    console.log(error);
  }
}

// Run the test
testOAuth2().catch(console.error);