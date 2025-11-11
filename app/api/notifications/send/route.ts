// API Route: Send Notifications for New Listings
import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/client';
import { searchService } from '@/lib/services/searchService';
import { notificationService } from '@/lib/services/notificationService';
import { Client, SavedSearch } from '@/lib/types';

/**
 * Daily notification check and send
 * This should be called by a cron job service
 * Checks all active saved searches for new matching listings and sends notifications
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

    console.log('Starting notification check...');

    const supabase = getServiceSupabase();

    // Get all active clients with active saved searches
    const { data: searches, error: searchError } = await supabase
      .from('saved_searches')
      .select('*, clients(*)')
      .eq('active', true)
      .eq('clients.status', 'active');

    if (searchError) {
      throw new Error(searchError.message);
    }

    let notificationsSent = 0;
    let errors = 0;

    for (const searchRecord of searches || []) {
      try {
        const search: SavedSearch = {
          id: searchRecord.id,
          clientId: searchRecord.client_id,
          name: searchRecord.name,
          criteria: {
            cities: searchRecord.cities,
            neighborhoods: searchRecord.neighborhoods,
            minPrice: searchRecord.min_price,
            maxPrice: searchRecord.max_price,
            propertyTypes: searchRecord.property_types,
            minBedrooms: searchRecord.min_bedrooms,
            minBathrooms: searchRecord.min_bathrooms,
            minSquareFeet: searchRecord.min_square_feet,
            maxSquareFeet: searchRecord.max_square_feet,
            features: searchRecord.features,
            keywords: searchRecord.keywords,
          },
          createdAt: new Date(searchRecord.created_at),
          lastNotified: searchRecord.last_notified_at ? new Date(searchRecord.last_notified_at) : undefined,
          active: searchRecord.active,
        };

        const client: Client = {
          id: searchRecord.clients.id,
          name: searchRecord.clients.name,
          email: searchRecord.clients.email,
          phone: searchRecord.clients.phone,
          username: searchRecord.clients.username,
          createdAt: new Date(searchRecord.clients.created_at),
          lastLoginAt: searchRecord.clients.last_login_at ? new Date(searchRecord.clients.last_login_at) : undefined,
          expiryDate: new Date(searchRecord.clients.expiry_date),
          status: searchRecord.clients.status,
          acceptedTOU: searchRecord.clients.accepted_tou,
          acceptedTOUDate: searchRecord.clients.accepted_tou_date ? new Date(searchRecord.clients.accepted_tou_date) : undefined,
          notificationPreferences: {
            email: searchRecord.clients.notification_email,
            sms: searchRecord.clients.notification_sms,
            frequency: searchRecord.clients.notification_frequency,
          },
        };

        // Find new matching listings
        const newListings = await searchService.findNewMatchingListings(search);

        if (newListings.length > 0 && client.notificationPreferences.email) {
          // Send notification email
          const sent = await notificationService.sendNewListingsEmail(client, search, newListings);

          if (sent) {
            // Record notification
            await supabase.from('notifications').insert({
              client_id: client.id,
              search_id: search.id,
              listing_ids: newListings.map(l => l.mlsNumber),
              status: 'sent',
              type: 'email',
            });

            // Update last_notified timestamp
            await supabase
              .from('saved_searches')
              .update({ last_notified_at: new Date().toISOString() })
              .eq('id', search.id);

            notificationsSent++;
            console.log(`Sent notification to ${client.email} for search "${search.name}" (${newListings.length} new listings)`);
          } else {
            errors++;
          }
        }
      } catch (error) {
        console.error('Error processing search notification:', error);
        errors++;
      }
    }

    console.log(`Notification check complete. Sent: ${notificationsSent}, Errors: ${errors}`);

    return NextResponse.json({
      success: true,
      notificationsSent,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Notification send error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Notification send failed',
      },
      { status: 500 }
    );
  }
}
