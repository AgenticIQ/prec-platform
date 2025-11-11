// API Route: Refresh IDX Data (Daily Cron Job)
import { NextRequest, NextResponse } from 'next/server';
import { idxBrokerApi } from '@/lib/services/idxBrokerApi';
import { searchService } from '@/lib/services/searchService';
import { getServiceSupabase } from '@/lib/supabase/client';
import { Property } from '@/lib/types';

/**
 * Daily data refresh endpoint
 * This should be called by a cron job service (Vercel Cron, GitHub Actions, etc.)
 * Fetches all active IDX listings and updates the local database
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

    console.log('Starting IDX data refresh...');

    // Fetch all active listings from IDX Broker API
    const result = await idxBrokerApi.fetchAllActiveListings();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch listings');
    }

    const listings = result.data;
    console.log(`Fetched ${listings.length} active listings from IDX Broker API`);

    const supabase = getServiceSupabase();

    // Delete all existing listings (will be replaced with fresh data)
    await supabase.from('listings').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert new listings in batches
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < listings.length; i += batchSize) {
      const batch = listings.slice(i, i + batchSize);
      const dbRecords = batch.map((listing: Property) => searchService.transformPropertyToDb(listing));

      const { error } = await supabase.from('listings').insert(dbRecords);

      if (error) {
        console.error('Error inserting batch:', error);
        // Continue with next batch
      } else {
        insertedCount += batch.length;
      }
    }

    console.log(`Successfully refreshed ${insertedCount} listings`);

    // Clean up stale notifications
    await supabase
      .from('notifications')
      .delete()
      .lt('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // 30 days old

    return NextResponse.json({
      success: true,
      message: `Refreshed ${insertedCount} listings`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('IDX refresh error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Refresh failed',
      },
      { status: 500 }
    );
  }
}
