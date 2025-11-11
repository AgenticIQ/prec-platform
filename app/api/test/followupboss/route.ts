// Test Follow Up Boss Connection
import { NextResponse } from 'next/server';
import { followUpBossService } from '@/lib/services/followUpBossService';

export async function GET() {
  try {
    // Test API connection
    const isConnected = await followUpBossService.verifyConnection();

    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Follow Up Boss connection failed',
        message: 'Could not connect to Follow Up Boss API. Check your API key.',
      }, { status: 500 });
    }

    // Create test lead
    const testClient = {
      id: 'test-id',
      name: 'Test Lead from API',
      email: 'testlead@example.com',
      phone: '250-555-TEST',
      username: 'testlead123',
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

    const leadCreated = await followUpBossService.createLead(testClient, {
      test_lead: true,
      source_detail: 'API Connection Test',
    });

    if (leadCreated) {
      return NextResponse.json({
        success: true,
        message: 'Follow Up Boss connection successful!',
        testLead: {
          name: testClient.name,
          email: testClient.email,
          phone: testClient.phone,
        },
        note: 'Test lead created in Follow Up Boss. You can delete it from your FUB dashboard.',
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to create test lead',
        message: 'Connection works but lead creation failed. Check server logs.',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Follow Up Boss test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error,
    }, { status: 500 });
  }
}
