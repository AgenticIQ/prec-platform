// Test Email Sending
import { NextResponse } from 'next/server';
import { notificationService } from '@/lib/services/notificationService';

export async function GET() {
  try {
    // Test SMTP connection
    const isConnected = await notificationService.verifyConnection();

    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'SMTP connection failed',
        message: 'Could not connect to Gmail SMTP server. Check credentials.',
      }, { status: 500 });
    }

    // Send test email
    const testClient = {
      id: 'test-id',
      name: 'Test User',
      email: process.env.ADMIN_EMAIL || 'josh@capitalcitygroup.ca',
      phone: '250-555-1234',
      username: 'testuser123',
      createdAt: new Date(),
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: 'active' as const,
      acceptedTOU: true,
      notificationPreferences: {
        email: true,
        sms: false,
        frequency: 'daily' as const,
      },
    };

    const temporaryPassword = 'TestPassword123!';

    const emailSent = await notificationService.sendWelcomeEmail(
      testClient,
      temporaryPassword
    );

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        sentTo: testClient.email,
        smtpConfig: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER,
          from: process.env.SMTP_FROM_EMAIL,
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to send test email',
        message: 'Check server logs for details',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error,
    }, { status: 500 });
  }
}
