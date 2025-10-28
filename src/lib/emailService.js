import nodemailer from 'nodemailer';
import { google } from 'googleapis';

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.oauth2Client = null;
    this.initPromise = this.initTransporter();
  }

  async initTransporter() {
    try {
      // Check if all required OAuth2 credentials are available
      const {
        GMAIL_CLIENT_ID,
        GMAIL_CLIENT_SECRET,
        GMAIL_REFRESH_TOKEN,
        EMAIL_FROM,
        EMAIL_FROM_NAME
      } = process.env;

      if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN || !EMAIL_FROM) {
        console.log('⚠️  Email service not configured - missing OAuth2 credentials');
        console.log('Required: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, EMAIL_FROM');
        return;
      }

      // Create OAuth2 client to generate access token
      this.oauth2Client = new google.auth.OAuth2(
        GMAIL_CLIENT_ID,
        GMAIL_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground' // redirect URL
      );

      this.oauth2Client.setCredentials({
        refresh_token: GMAIL_REFRESH_TOKEN
      });

      // Get access token
      const accessToken = await this.oauth2Client.getAccessToken();

      this.transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: EMAIL_FROM,
          clientId: GMAIL_CLIENT_ID,
          clientSecret: GMAIL_CLIENT_SECRET,
          refreshToken: GMAIL_REFRESH_TOKEN,
          accessToken: accessToken.token,
        },
      });

      this.isConfigured = true;
      console.log('✅ Email service configured with OAuth2');

      // Verify the configuration
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('❌ Email service verification failed:', error);
          this.isConfigured = false;
        } else {
          console.log('✅ Email service verified and ready to send emails');
        }
      });

    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      this.isConfigured = false;
    }
  }

  async sendStaffInvitation(invitationData) {
    // Wait for initialization to complete
    await this.initPromise;
    
    if (!this.isConfigured) {
      console.log('⚠️  Email service not configured - invitation email not sent');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      // Refresh access token before sending
      if (this.oauth2Client) {
        const accessToken = await this.oauth2Client.getAccessToken();
        this.transporter.options.auth.accessToken = accessToken.token;
      }

      const { email, firstName, lastName, role, token, invitedBy } = invitationData;
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL || 'https://your-app.onrender.com'
        : 'http://localhost:5173';
      
      const invitationUrl = `${baseUrl}/accept-invitation?token=${token}`;

      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'Musical Arts Institute',
          address: process.env.EMAIL_FROM
        },
        to: email,
        subject: `Invitation to join Musical Arts Institute as ${role}`,
        html: this.generateInvitationEmailHTML({
          firstName,
          lastName,
          role,
          invitationUrl,
          invitedBy,
          expiryDays: 7
        })
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Invitation email sent successfully:', result.messageId);
      
      return { 
        success: true, 
        messageId: result.messageId,
        message: 'Invitation email sent successfully'
      };

    } catch (error) {
      console.error('❌ Failed to send invitation email:', error);
      return { 
        success: false, 
        error: error.message,
        message: 'Failed to send invitation email'
      };
    }
  }

  generateInvitationEmailHTML({ firstName, lastName, role, invitationUrl, invitedBy, expiryDays }) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Staff Invitation - Musical Arts Institute</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #eab308; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background-color: #eab308; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .button:hover { background-color: #ca8a04; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Musical Arts Institute</h1>
        <h2>Staff Invitation</h2>
    </div>
    
    <div class="content">
        <h3>Hello ${firstName} ${lastName}!</h3>
        
        <p>You have been invited to join the Musical Arts Institute team as a <strong>${role}</strong>.</p>
        
        <p>We're excited to have you on board! To complete your registration and set up your account, please click the button below:</p>
        
        <div style="text-align: center;">
            <a href="${invitationUrl}" class="button">Accept Invitation & Create Account</a>
        </div>
        
        <div class="warning">
            <strong>⏰ Important:</strong> This invitation will expire in ${expiryDays} days. Please complete your registration before then.
        </div>
        
        <h4>What happens next?</h4>
        <ul>
            <li>Click the invitation link above</li>
            <li>Create your password and complete your profile</li>
            <li>Access your personalized dashboard</li>
            <li>Start collaborating with the team</li>
        </ul>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
        
        <p>Welcome to the Musical Arts Institute family!</p>
        
        <p><strong>The ReachMAI Team</strong></p>
    </div>
    
    <div class="footer">
        <p>If you're having trouble clicking the button above, copy and paste this URL into your browser:</p>
        <p><a href="${invitationUrl}">${invitationUrl}</a></p>
        
        <p>This email was sent from portal@musicalartsinstitute.org</p>
        <p>If you received this email by mistake, you can safely ignore it.</p>
    </div>
</body>
</html>
    `;
  }

  // Method to send password reset emails (for future use)
  async sendPasswordReset(email, resetToken, firstName = '') {
    if (!this.isConfigured) {
      console.log('⚠️  Email service not configured - password reset email not sent');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL || 'https://your-app.onrender.com'
        : 'http://localhost:5173';
      
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'Musical Arts Institute',
          address: process.env.EMAIL_FROM
        },
        to: email,
        subject: 'Reset Your Password - Musical Arts Institute',
        html: `
          <h2>Password Reset Request</h2>
          <p>Hello${firstName ? ' ' + firstName : ''},</p>
          <p>You requested to reset your password for your Musical Arts Institute account.</p>
          <p><a href="${resetUrl}" style="background-color: #eab308; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
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