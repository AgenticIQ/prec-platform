// Notification Service - Gmail SMTP + Optional Twilio SMS
import nodemailer from 'nodemailer';
import { Property, Client, SavedSearch } from '@/lib/types';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || '';
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || 'PREC Real Estate';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Notification Service for sending emails and SMS
 */
class NotificationService {
  /**
   * Send new listings notification to client
   */
  async sendNewListingsEmail(
    client: Client,
    search: SavedSearch,
    properties: Property[]
  ): Promise<boolean> {
    try {
      const emailData = this.buildNewListingsEmail(client, search, properties);

      await transporter.sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      });

      console.log(`Sent new listings email to ${client.email}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send welcome email to new client
   */
  async sendWelcomeEmail(
    client: Client,
    temporaryPassword: string
  ): Promise<boolean> {
    try {
      const loginUrl = `${APP_URL}/portal/login`;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .credentials { background-color: #e5e7eb; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to PREC Real Estate Client Portal</h1>
            </div>
            <div class="content">
              <p>Hello ${client.name},</p>

              <p>Your client portal account has been created! You now have access to personalized property searches and automatic notifications when new listings match your criteria.</p>

              <div class="credentials">
                <strong>Your Login Credentials:</strong><br>
                Username: ${client.username}<br>
                Temporary Password: ${temporaryPassword}
              </div>

              <p>Please log in and change your password on first access.</p>

              <a href="${loginUrl}" class="button">Access Your Portal</a>

              <p><strong>What you can do in your portal:</strong></p>
              <ul>
                <li>View properties matching your search criteria</li>
                <li>Get automatic email notifications for new listings</li>
                <li>Browse detailed property information and photos</li>
                <li>View properties on an interactive map</li>
              </ul>

              <p><strong>Important:</strong> Your portal access will expire after 90 days. We'll send you a reminder before expiration.</p>

              <p>If you have any questions, please don't hesitate to contact me.</p>

              <p>Best regards,<br>${SMTP_FROM_NAME}</p>
            </div>
            <div class="footer">
              <p>This email was sent from PREC Real Estate Client Portal.</p>
              <p><a href="${APP_URL}/portal/unsubscribe">Unsubscribe from notifications</a></p>
            </div>
          </div>
        </body>
        </html>
      `;

      const text = `
Welcome to PREC Real Estate Client Portal

Hello ${client.name},

Your client portal account has been created!

Login Credentials:
Username: ${client.username}
Temporary Password: ${temporaryPassword}

Login at: ${loginUrl}

Please log in and change your password on first access.

Your portal access will expire after 90 days. We'll send you a reminder before expiration.

Best regards,
${SMTP_FROM_NAME}
      `;

      await transporter.sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
        to: client.email,
        subject: 'Welcome to PREC Real Estate Client Portal',
        html,
        text,
      });

      console.log(`Sent welcome email to ${client.email}`);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  /**
   * Send expiry reminder email
   */
  async sendExpiryReminderEmail(client: Client, daysUntilExpiry: number): Promise<boolean> {
    try {
      const renewUrl = `${APP_URL}/portal/renew`;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .warning { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Portal Access Expiring Soon</h1>
            </div>
            <div class="content">
              <p>Hello ${client.name},</p>

              <div class="warning">
                <strong>⚠️ Your portal access will expire in ${daysUntilExpiry} days.</strong>
              </div>

              <p>To continue receiving property updates and accessing your saved searches, please contact us to renew your access.</p>

              <p>You can extend your access for up to 180 days total. After that, you'll need to re-register.</p>

              <a href="${renewUrl}" class="button">Request Renewal</a>

              <p>If you no longer wish to receive property updates, no action is needed and your access will automatically expire.</p>

              <p>Best regards,<br>${SMTP_FROM_NAME}</p>
            </div>
            <div class="footer">
              <p><a href="${APP_URL}/portal/unsubscribe">Unsubscribe from notifications</a></p>
            </div>
          </div>
        </body>
        </html>
      `;

      const text = `
Portal Access Expiring Soon

Hello ${client.name},

Your portal access will expire in ${daysUntilExpiry} days.

To continue receiving property updates, please contact us to renew your access.

Visit: ${renewUrl}

Best regards,
${SMTP_FROM_NAME}
      `;

      await transporter.sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
        to: client.email,
        subject: `Portal Access Expiring in ${daysUntilExpiry} Days`,
        html,
        text,
      });

      console.log(`Sent expiry reminder to ${client.email}`);
      return true;
    } catch (error) {
      console.error('Error sending expiry reminder:', error);
      return false;
    }
  }

  /**
   * Build new listings notification email
   */
  private buildNewListingsEmail(
    client: Client,
    search: SavedSearch,
    properties: Property[]
  ): EmailData {
    const portalUrl = `${APP_URL}/portal/dashboard`;
    const propertyCount = properties.length;

    const propertiesHtml = properties.slice(0, 5).map(property => {
      const photoUrl = property.photos[0]?.url || '/images/placeholder-property.jpg';
      const propertyUrl = `${APP_URL}/portal/property/${property.mlsNumber}`;

      return `
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 15px 0; background: white;">
          <img src="${photoUrl}" alt="${property.address}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 6px;">
          <h3 style="margin: 10px 0;">${property.address}</h3>
          <p style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 10px 0;">$${property.price.toLocaleString()}</p>
          <p style="margin: 10px 0;">
            ${property.bedrooms || 'N/A'} beds • ${property.bathrooms || 'N/A'} baths • ${property.squareFeet ? property.squareFeet.toLocaleString() + ' sqft' : 'N/A'}
          </p>
          <p style="margin: 10px 0; color: #6b7280;">${property.propertyType} in ${property.city}</p>
          <p style="margin: 10px 0; font-size: 12px; color: #9ca3af;">Listed by: ${property.listingBrokerage}</p>
          <a href="${propertyUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 10px;">View Details</a>
        </div>
      `;
    }).join('');

    const moreListingsText = propertyCount > 5
      ? `<p><strong>Plus ${propertyCount - 5} more properties</strong> matching your criteria. <a href="${portalUrl}">View all in your portal</a></p>`
      : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 New Properties Match Your Search!</h1>
          </div>
          <div class="content">
            <p>Hello ${client.name},</p>

            <p>We found <strong>${propertyCount} new ${propertyCount === 1 ? 'property' : 'properties'}</strong> matching your search "${search.name}":</p>

            ${propertiesHtml}

            ${moreListingsText}

            <a href="${portalUrl}" class="button">View All in Your Portal</a>

            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
              MLS® property information is provided under copyright© by the Vancouver Island Real Estate Board and Victoria Real Estate Board.
              The information is from sources deemed reliable, but should not be relied upon without independent verification.
            </p>
          </div>
          <div class="footer">
            <p><a href="${APP_URL}/portal/searches">Manage your saved searches</a> | <a href="${APP_URL}/portal/unsubscribe">Unsubscribe</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
New Properties Match Your Search!

Hello ${client.name},

We found ${propertyCount} new ${propertyCount === 1 ? 'property' : 'properties'} matching your search "${search.name}".

${properties.slice(0, 5).map(p => `
${p.address}
$${p.price.toLocaleString()} • ${p.bedrooms || 'N/A'} beds • ${p.bathrooms || 'N/A'} baths
${p.propertyType} in ${p.city}
View: ${APP_URL}/portal/property/${p.mlsNumber}
`).join('\n')}

${propertyCount > 5 ? `\nPlus ${propertyCount - 5} more properties in your portal.` : ''}

View all: ${portalUrl}

MLS® property information is provided under copyright© by the Vancouver Island Real Estate Board and Victoria Real Estate Board.
    `;

    return {
      to: client.email,
      subject: `${propertyCount} New ${propertyCount === 1 ? 'Property' : 'Properties'} Match Your Search`,
      html,
      text,
    };
  }

  /**
   * Send admin notification about new client registration
   */
  async sendAdminNewClientNotification(client: Client): Promise<boolean> {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || '';

      if (!adminEmail) {
        console.warn('ADMIN_EMAIL not configured - skipping admin notification');
        return false;
      }

      const portalUrl = `${APP_URL}/admin`;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .info-box { background-color: #e5e7eb; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 New Client Registration</h1>
            </div>
            <div class="content">
              <p><strong>A new client has registered on your PREC Real Estate platform!</strong></p>

              <div class="info-box">
                <strong>Client Details:</strong><br>
                <strong>Name:</strong> ${client.name}<br>
                <strong>Email:</strong> ${client.email}<br>
                <strong>Phone:</strong> ${client.phone}<br>
                <strong>Username:</strong> ${client.username}<br>
                <strong>Registration Date:</strong> ${client.createdAt.toLocaleDateString()}<br>
                <strong>Portal Expiry:</strong> ${client.expiryDate.toLocaleDateString()} (90 days)
              </div>

              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Follow up with the client to understand their property needs</li>
                <li>Review their saved search criteria (if any)</li>
                <li>Ensure they received their welcome email</li>
              </ul>

              <a href="${portalUrl}" class="button">View Admin Dashboard</a>

              <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
                The client has been automatically added to your Follow Up Boss CRM (if configured).
              </p>
            </div>
            <div class="footer">
              <p>This notification was sent from PREC Real Estate Platform</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const text = `
New Client Registration

A new client has registered on your PREC Real Estate platform!

Client Details:
- Name: ${client.name}
- Email: ${client.email}
- Phone: ${client.phone}
- Username: ${client.username}
- Registration Date: ${client.createdAt.toLocaleDateString()}
- Portal Expiry: ${client.expiryDate.toLocaleDateString()} (90 days)

Next Steps:
- Follow up with the client to understand their property needs
- Review their saved search criteria (if any)
- Ensure they received their welcome email

View Admin Dashboard: ${portalUrl}

The client has been automatically added to your Follow Up Boss CRM (if configured).
      `;

      await transporter.sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
        to: adminEmail,
        subject: `🎉 New Client Registration: ${client.name}`,
        html,
        text,
      });

      console.log(`Sent admin notification about new client: ${client.email}`);
      return true;
    } catch (error) {
      console.error('Error sending admin notification:', error);
      return false;
    }
  }

  /**
   * Send search notification to client (alias for sendNewListingsEmail)
   */
  async sendSearchNotification(
    client: any,
    search: any,
    properties: Property[]
  ): Promise<boolean> {
    return this.sendNewListingsEmail(client, search, properties);
  }

  /**
   * Send admin shadow notification (copy of client notification)
   */
  async sendAdminShadowNotification(
    adminEmail: string,
    client: any,
    search: any,
    properties: Property[]
  ): Promise<boolean> {
    try {
      const propertyCount = properties.length;
      const portalUrl = `${APP_URL}/admin/searches`;

      const propertiesHtml = properties.slice(0, 3).map(property => {
        const photoUrl = property.photos[0]?.url || '/images/placeholder-property.jpg';
        return `
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; margin: 10px 0; background: white;">
            <img src="${photoUrl}" alt="${property.address}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 6px;">
            <h4 style="margin: 8px 0;">${property.address}</h4>
            <p style="font-size: 20px; font-weight: bold; color: #2563eb; margin: 5px 0;">$${property.price.toLocaleString()}</p>
            <p style="margin: 5px 0; font-size: 14px; color: #6b7280;">
              ${property.bedrooms || 'N/A'} beds • ${property.bathrooms || 'N/A'} baths
            </p>
          </div>
        `;
      }).join('');

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .client-info { background-color: #dbeafe; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Shadow Alert: Client Notification</h1>
            </div>
            <div class="content">
              <p><strong>This is a shadow copy of a notification sent to your client.</strong></p>

              <div class="client-info">
                <strong>Client:</strong> ${client.name} (${client.email})<br>
                <strong>Search:</strong> "${search.searchName}"<br>
                <strong>Properties Found:</strong> ${propertyCount}
              </div>

              <p><strong>Properties sent to client:</strong></p>

              ${propertiesHtml}

              ${propertyCount > 3 ? `<p><em>Plus ${propertyCount - 3} more properties...</em></p>` : ''}

              <a href="${portalUrl}" class="button">Manage Client Searches</a>

              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
                You're receiving this because shadow notifications are enabled for this search.
                You can disable shadow notifications in the admin dashboard.
              </p>
            </div>
            <div class="footer">
              <p>PREC Real Estate - Admin Shadow Notification</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const text = `
Shadow Alert: Client Notification

This is a shadow copy of a notification sent to your client.

Client: ${client.name} (${client.email})
Search: "${search.searchName}"
Properties Found: ${propertyCount}

Properties sent to client:
${properties.slice(0, 3).map(p => `
${p.address}
$${p.price.toLocaleString()} • ${p.bedrooms || 'N/A'} beds • ${p.bathrooms || 'N/A'} baths
`).join('\n')}

${propertyCount > 3 ? `Plus ${propertyCount - 3} more properties...` : ''}

Manage Client Searches: ${portalUrl}

You're receiving this because shadow notifications are enabled for this search.
      `;

      await transporter.sendMail({
        from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
        to: adminEmail,
        subject: `🔔 Shadow: ${propertyCount} Properties for ${client.name}`,
        html,
        text,
      });

      console.log(`Sent shadow notification to admin for client: ${client.email}`);
      return true;
    } catch (error) {
      console.error('Error sending admin shadow notification:', error);
      return false;
    }
  }

  /**
   * Send SMS notification (optional - requires Twilio setup)
   */
  async sendSmsNotification(phone: string, message: string): Promise<boolean> {
    // TODO: Implement Twilio SMS if needed
    console.log(`SMS to ${phone}: ${message}`);
    return true;
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
