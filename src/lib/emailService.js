import nodemailer from 'nodemailer';import nodemailer from 'nodemailer';

import { google } from 'googleapis';import { google } from 'googleapis';



// OAuth2 setupclass EmailService {

const oauth2Client = new google.auth.OAuth2(  constructor() {

  process.env.GMAIL_CLIENT_ID,    this.transporter = null;

  process.env.GMAIL_CLIENT_SECRET,    this.isConfigured = false;

  'https://developers.google.com/oauthplayground'    this.oauth2Client = null;

);    this.initPromise = this.initTransporter();

  }

oauth2Client.setCredentials({

  refresh_token: process.env.GMAIL_REFRESH_TOKEN  async initTransporter() {

});    try {

      // Check if all required OAuth2 credentials are available

async function createTransporter() {      const {

  try {        GMAIL_CLIENT_ID,

    console.log('🔧 Creating email transporter...');        GMAIL_CLIENT_SECRET,

            GMAIL_REFRESH_TOKEN,

    // Check if OAuth2 credentials are available        EMAIL_FROM,

    if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET || !process.env.GMAIL_REFRESH_TOKEN) {        EMAIL_FROM_NAME

      console.log('⚠️  Missing OAuth2 credentials - Email service will not be available');      } = process.env;

      console.log('Required: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, EMAIL_FROM');

      console.log('Environment check:');      if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN || !EMAIL_FROM) {

      console.log('- GMAIL_CLIENT_ID:', process.env.GMAIL_CLIENT_ID ? `${process.env.GMAIL_CLIENT_ID.substring(0, 20)}...` : '❌ Missing');        console.log('⚠️  Email service not configured - missing OAuth2 credentials');

      console.log('- GMAIL_CLIENT_SECRET:', process.env.GMAIL_CLIENT_SECRET ? '✅ Present' : '❌ Missing');        console.log('Required: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, EMAIL_FROM');

      console.log('- GMAIL_REFRESH_TOKEN:', process.env.GMAIL_REFRESH_TOKEN ? `${process.env.GMAIL_REFRESH_TOKEN.substring(0, 20)}...` : '❌ Missing');        console.log('Environment check:');

      console.log('- EMAIL_FROM:', process.env.EMAIL_FROM || '❌ Missing');        console.log('- GMAIL_CLIENT_ID:', GMAIL_CLIENT_ID ? `${GMAIL_CLIENT_ID.substring(0, 20)}...` : '❌ Missing');

      return null;        console.log('- GMAIL_CLIENT_SECRET:', GMAIL_CLIENT_SECRET ? '✅ Present' : '❌ Missing');

    }        console.log('- GMAIL_REFRESH_TOKEN:', GMAIL_REFRESH_TOKEN ? `${GMAIL_REFRESH_TOKEN.substring(0, 20)}...` : '❌ Missing');

        console.log('- EMAIL_FROM:', EMAIL_FROM || '❌ Missing');

    console.log('🔑 OAuth2 credentials found, getting access token...');        return;

          }

    // Get access token

    const accessToken = await oauth2Client.getAccessToken();      console.log('🔑 OAuth2 credentials found, creating client...');

          console.log('- Client ID:', GMAIL_CLIENT_ID.substring(0, 20) + '...');

    if (!accessToken.token) {      console.log('- Refresh Token:', GMAIL_REFRESH_TOKEN.substring(0, 20) + '...');

      throw new Error('Failed to obtain access token');

    }      // Create OAuth2 client to generate access token

      this.oauth2Client = new google.auth.OAuth2(

    console.log('✅ Access token obtained successfully');        GMAIL_CLIENT_ID,

        GMAIL_CLIENT_SECRET,

    // Create nodemailer transporter with OAuth2        'https://developers.google.com/oauthplayground' // redirect URL

    const transporter = nodemailer.createTransporter({      );

      service: 'gmail',

      auth: {      this.oauth2Client.setCredentials({

        type: 'OAuth2',        refresh_token: GMAIL_REFRESH_TOKEN

        user: process.env.EMAIL_FROM,      });

        clientId: process.env.GMAIL_CLIENT_ID,

        clientSecret: process.env.GMAIL_CLIENT_SECRET,      console.log('🔄 Attempting to get access token...');

        refreshToken: process.env.GMAIL_REFRESH_TOKEN,      // Get access token

        accessToken: accessToken.token      const accessToken = await this.oauth2Client.getAccessToken();

      }      console.log('✅ Access token obtained:', accessToken.token ? 'Success' : 'Failed');

    });

      this.transporter = nodemailer.createTransport({

    // Test the connection        service: 'gmail',

    await transporter.verify();        auth: {

    console.log('✅ Email transporter verified successfully');          type: 'OAuth2',

              user: EMAIL_FROM,

    return transporter;          clientId: GMAIL_CLIENT_ID,

              clientSecret: GMAIL_CLIENT_SECRET,

  } catch (error) {          refreshToken: GMAIL_REFRESH_TOKEN,

    console.error('❌ Failed to create email transporter:', error);          accessToken: accessToken.token,

    return null;        },

  }      });

}

      this.isConfigured = true;

export async function sendStaffInvitation(invitationData) {      console.log('✅ Email service configured with OAuth2');

  try {

    console.log('📧 Starting staff invitation email process...');      // Verify the configuration

          this.transporter.verify((error, success) => {

    const transporter = await createTransporter();        if (error) {

              console.error('❌ Email service verification failed:', error);

    if (!transporter) {          this.isConfigured = false;

      console.log('⚠️  Email service not configured - invitation email not sent');        } else {

      return { success: false, message: 'Email service not configured' };          console.log('✅ Email service verified and ready to send emails');

    }        }

      });

    const { email, firstName, lastName, role, token, invitedBy } = invitationData;

    const baseUrl = process.env.NODE_ENV === 'production'     } catch (error) {

      ? process.env.FRONTEND_URL || 'https://your-app.onrender.com'      console.error('❌ Failed to initialize email service:', error);

      : 'http://localhost:5173';      this.isConfigured = false;

        }

    const invitationUrl = `${baseUrl}/accept-invitation?token=${token}`;  }



    console.log('📮 Preparing email content...');  async sendStaffInvitation(invitationData) {

    console.log('- To:', email);    // Wait for initialization to complete

    console.log('- Role:', role);    await this.initPromise;

    console.log('- Invited by:', invitedBy);    

    if (!this.isConfigured) {

    const mailOptions = {      console.log('⚠️  Email service not configured - invitation email not sent');

      from: {      return { success: false, message: 'Email service not configured' };

        name: process.env.EMAIL_FROM_NAME || 'Musical Arts Institute',    }

        address: process.env.EMAIL_FROM

      },    try {

      to: email,      // Refresh access token before sending

      subject: `Invitation to join Musical Arts Institute as ${role}`,      console.log('📧 Preparing to send invitation email...');

      html: generateInvitationEmailHTML({      if (this.oauth2Client) {

        firstName,        console.log('🔄 Refreshing access token for email send...');

        lastName,        try {

        role,          const accessToken = await this.oauth2Client.getAccessToken();

        invitationUrl,          if (accessToken.token) {

        invitedBy,            this.transporter.options.auth.accessToken = accessToken.token;

        expiryDays: 7            console.log('✅ Access token refreshed successfully');

      })          } else {

    };            console.error('❌ Failed to get access token - token is null');

            return { success: false, message: 'Failed to refresh access token' };

    console.log('📤 Sending email...');          }

    const result = await transporter.sendMail(mailOptions);        } catch (refreshError) {

    console.log('✅ Invitation email sent successfully:', result.messageId);          console.error('❌ OAuth2 token refresh failed:', refreshError.message);

              return { success: false, message: 'OAuth2 token refresh failed: ' + refreshError.message };

    return {         }

      success: true,       }

      messageId: result.messageId,

      message: 'Invitation email sent successfully'      const { email, firstName, lastName, role, token, invitedBy } = invitationData;

    };      const baseUrl = process.env.NODE_ENV === 'production' 

        ? process.env.FRONTEND_URL || 'https://your-app.onrender.com'

  } catch (error) {        : 'http://localhost:5173';

    console.error('❌ Failed to send invitation email:', error);      

    return {       const invitationUrl = `${baseUrl}/accept-invitation?token=${token}`;

      success: false, 

      error: error.message,      const mailOptions = {

      message: 'Failed to send invitation email: ' + error.message        from: {

    };          name: process.env.EMAIL_FROM_NAME || 'Musical Arts Institute',

  }          address: process.env.EMAIL_FROM

}        },

        to: email,

function generateInvitationEmailHTML({ firstName, lastName, role, invitationUrl, invitedBy, expiryDays }) {        subject: `Invitation to join Musical Arts Institute as ${role}`,

  return `        html: this.generateInvitationEmailHTML({

<!DOCTYPE html>          firstName,

<html lang="en">          lastName,

<head>          role,

    <meta charset="UTF-8">          invitationUrl,

    <meta name="viewport" content="width=device-width, initial-scale=1.0">          invitedBy,

    <title>Staff Invitation - Musical Arts Institute</title>          expiryDays: 7

    <style>        })

        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }      };

        .header { background-color: #eab308; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }

        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }      const result = await this.transporter.sendMail(mailOptions);

        .button { display: inline-block; background-color: #eab308; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }      console.log('✅ Invitation email sent successfully:', result.messageId);

        .button:hover { background-color: #ca8a04; }      

        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }      return { 

        .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px; margin: 20px 0; }        success: true, 

    </style>        messageId: result.messageId,

</head>        message: 'Invitation email sent successfully'

<body>      };

    <div class="header">

        <h1>Musical Arts Institute</h1>    } catch (error) {

        <h2>Staff Invitation</h2>      console.error('❌ Failed to send invitation email:', error);

    </div>      return { 

            success: false, 

    <div class="content">        error: error.message,

        <h3>Hello ${firstName} ${lastName},</h3>        message: 'Failed to send invitation email'

              };

        <p>You have been invited by <strong>${invitedBy}</strong> to join the Musical Arts Institute team as a <strong>${role}</strong>.</p>    }

          }

        <p>To accept this invitation and set up your account, please click the button below:</p>

          generateInvitationEmailHTML({ firstName, lastName, role, invitationUrl, invitedBy, expiryDays }) {

        <div style="text-align: center;">    return `

            <a href="${invitationUrl}" class="button">Accept Invitation</a><!DOCTYPE html>

        </div><html lang="en">

        <head>

        <p>Or copy and paste this link into your browser:</p>    <meta charset="UTF-8">

        <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 4px; font-family: monospace;">    <meta name="viewport" content="width=device-width, initial-scale=1.0">

            ${invitationUrl}    <title>Staff Invitation - Musical Arts Institute</title>

        </p>    <style>

                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }

        <div class="warning">        .header { background-color: #eab308; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }

            <strong>⏰ Important:</strong> This invitation will expire in ${expiryDays} days. Please accept it as soon as possible.        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }

        </div>        .button { display: inline-block; background-color: #eab308; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }

                .button:hover { background-color: #ca8a04; }

        <p>As a ${role}, you will have access to:</p>        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }

        <ul>        .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px; margin: 20px 0; }

            <li>Staff dashboard and management tools</li>    </style>

            <li>Student and class management</li></head>

            <li>Scheduling and calendar features</li><body>

            <li>Communication tools</li>    <div class="header">

        </ul>        <h1>Musical Arts Institute</h1>

                <h2>Staff Invitation</h2>

        <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>    </div>

            

        <p>Welcome to the Musical Arts Institute family!</p>    <div class="content">

                <h3>Hello ${firstName} ${lastName}!</h3>

        <p>Best regards,<br>        

        <strong>Musical Arts Institute Team</strong></p>        <p>You have been invited to join the Musical Arts Institute team as a <strong>${role}</strong>.</p>

    </div>        

            <p>We're excited to have you on board! To complete your registration and set up your account, please click the button below:</p>

    <div class="footer">        

        <p>This is an automated message. Please do not reply to this email.</p>        <div style="text-align: center;">

        <p>If you did not expect this invitation, please contact us immediately.</p>            <a href="${invitationUrl}" class="button">Accept Invitation & Create Account</a>

        <p>&copy; ${new Date().getFullYear()} Musical Arts Institute. All rights reserved.</p>        </div>

    </div>        

</body>        <div class="warning">

</html>            <strong>⏰ Important:</strong> This invitation will expire in ${expiryDays} days. Please complete your registration before then.

  `;        </div>

}        

        <h4>What happens next?</h4>

export async function sendWelcomeEmail(userData) {        <ul>

  try {            <li>Click the invitation link above</li>

    console.log('📧 Starting welcome email process...');            <li>Create your password and complete your profile</li>

                <li>Access your personalized dashboard</li>

    const transporter = await createTransporter();            <li>Start collaborating with the team</li>

            </ul>

    if (!transporter) {        

      console.log('⚠️  Email service not configured - welcome email not sent');        <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>

      return { success: false, message: 'Email service not configured' };        

    }        <p>Welcome to the Musical Arts Institute family!</p>

        

    const { email, firstName, lastName, role } = userData;        <p><strong>The ReachMAI Team</strong></p>

    </div>

    const mailOptions = {    

      from: {    <div class="footer">

        name: process.env.EMAIL_FROM_NAME || 'Musical Arts Institute',        <p>If you're having trouble clicking the button above, copy and paste this URL into your browser:</p>

        address: process.env.EMAIL_FROM        <p><a href="${invitationUrl}">${invitationUrl}</a></p>

      },        

      to: email,        <p>This email was sent from portal@musicalartsinstitute.org</p>

      subject: 'Welcome to Musical Arts Institute!',        <p>If you received this email by mistake, you can safely ignore it.</p>

      html: `    </div>

        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"></body>

          <h2 style="color: #eab308;">Welcome to Musical Arts Institute!</h2></html>

          <p>Dear ${firstName} ${lastName},</p>    `;

          <p>Welcome to Musical Arts Institute! Your account has been successfully created with the role of <strong>${role}</strong>.</p>  }

          <p>You can now log in to access your dashboard and explore all the features available to you.</p>

          <p>If you have any questions, please don't hesitate to contact our support team.</p>  // Method to send password reset emails (for future use)

          <p>Best regards,<br>Musical Arts Institute Team</p>  async sendPasswordReset(email, resetToken, firstName = '') {

        </div>    if (!this.isConfigured) {

      `      console.log('⚠️  Email service not configured - password reset email not sent');

    };      return { success: false, message: 'Email service not configured' };

    }

    const result = await transporter.sendMail(mailOptions);

    console.log('✅ Welcome email sent successfully:', result.messageId);    try {

          const baseUrl = process.env.NODE_ENV === 'production' 

    return {         ? process.env.FRONTEND_URL || 'https://your-app.onrender.com'

      success: true,         : 'http://localhost:5173';

      messageId: result.messageId,      

      message: 'Welcome email sent successfully'      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    };

      const mailOptions = {

  } catch (error) {        from: {

    console.error('❌ Failed to send welcome email:', error);          name: process.env.EMAIL_FROM_NAME || 'Musical Arts Institute',

    return {           address: process.env.EMAIL_FROM

      success: false,         },

      error: error.message,        to: email,

      message: 'Failed to send welcome email: ' + error.message        subject: 'Reset Your Password - Musical Arts Institute',

    };        html: `

  }          <h2>Password Reset Request</h2>

}          <p>Hello${firstName ? ' ' + firstName : ''},</p>

          <p>You requested to reset your password for your Musical Arts Institute account.</p>

// Default export for backward compatibility          <p><a href="${resetUrl}" style="background-color: #eab308; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>

const emailService = {          <p>This link will expire in 1 hour.</p>

  sendStaffInvitation,          <p>If you didn't request this, you can safely ignore this email.</p>

  sendWelcomeEmail        `

};      };



export default emailService;      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

export default emailService;