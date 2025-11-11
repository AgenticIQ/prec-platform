// API Route: Check and Process Client Expiry
import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/client';
import { notificationService } from '@/lib/services/notificationService';
import { Client } from '@/lib/types';

/**
 * Daily cron job to check client expiry and send reminders
 * Should be called by a cron service (Vercel Cron, GitHub Actions, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting client expiry check...');

    const supabase = getServiceSupabase();
    const now = new Date();

    // Step 1: Expire clients whose expiry date has passed
    const { data: expiredClients, error: expireError } = await supabase
      .from('clients')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('expiry_date', now.toISOString())
      .select();

    if (expireError) {
      console.error('Error expiring clients:', expireError);
    } else {
      console.log(`Expired ${expiredClients?.length || 0} clients`);

      // Log activity for expired clients
      if (expiredClients && expiredClients.length > 0) {
        await supabase.from('client_activity').insert(
          expiredClients.map(client => ({
            client_id: client.id,
            action: 'expired',
            details: 'Client account automatically expired',
          }))
        );
      }
    }

    // Step 2: Send reminders to clients expiring in 7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { data: expiringIn7Days, error: reminder7Error } = await supabase
      .from('clients')
      .select('*')
      .eq('status', 'active')
      .gte('expiry_date', now.toISOString())
      .lte('expiry_date', sevenDaysFromNow.toISOString());

    let reminders7DaysSent = 0;

    if (!reminder7Error && expiringIn7Days) {
      for (const clientData of expiringIn7Days) {
        const client: Client = {
          id: clientData.id,
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          username: clientData.username,
          createdAt: new Date(clientData.created_at),
          expiryDate: new Date(clientData.expiry_date),
          status: clientData.status,
          acceptedTOU: clientData.accepted_tou,
          notificationPreferences: {
            email: clientData.notification_email,
            sms: clientData.notification_sms,
            frequency: clientData.notification_frequency,
          },
        };

        const daysUntilExpiry = Math.ceil(
          (client.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        const sent = await notificationService.sendExpiryReminderEmail(client, daysUntilExpiry);

        if (sent) {
          reminders7DaysSent++;

          await supabase.from('client_activity').insert({
            client_id: client.id,
            action: 'expiry_reminder_sent',
            details: `Expiry reminder sent (${daysUntilExpiry} days until expiry)`,
          });
        }
      }
    }

    // Step 3: Send reminders to clients expiring in 14 days
    const fourteenDaysFromNow = new Date();
    fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);

    const { data: expiringIn14Days, error: reminder14Error } = await supabase
      .from('clients')
      .select('*')
      .eq('status', 'active')
      .gte('expiry_date', sevenDaysFromNow.toISOString())
      .lte('expiry_date', fourteenDaysFromNow.toISOString());

    let reminders14DaysSent = 0;

    if (!reminder14Error && expiringIn14Days) {
      for (const clientData of expiringIn14Days) {
        const client: Client = {
          id: clientData.id,
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          username: clientData.username,
          createdAt: new Date(clientData.created_at),
          expiryDate: new Date(clientData.expiry_date),
          status: clientData.status,
          acceptedTOU: clientData.accepted_tou,
          notificationPreferences: {
            email: clientData.notification_email,
            sms: clientData.notification_sms,
            frequency: clientData.notification_frequency,
          },
        };

        const daysUntilExpiry = Math.ceil(
          (client.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        const sent = await notificationService.sendExpiryReminderEmail(client, daysUntilExpiry);

        if (sent) {
          reminders14DaysSent++;

          await supabase.from('client_activity').insert({
            client_id: client.id,
            action: 'expiry_reminder_sent',
            details: `Expiry reminder sent (${daysUntilExpiry} days until expiry)`,
          });
        }
      }
    }

    console.log(`Expiry check complete. Expired: ${expiredClients?.length || 0}, Reminders sent: ${reminders7DaysSent + reminders14DaysSent}`);

    return NextResponse.json({
      success: true,
      expired: expiredClients?.length || 0,
      remindersSent: reminders7DaysSent + reminders14DaysSent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Expiry check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Expiry check failed',
      },
      { status: 500 }
    );
  }
}
