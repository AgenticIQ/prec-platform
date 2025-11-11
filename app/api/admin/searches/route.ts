// Admin API - View All Client Searches
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/admin/searches
 * Get all saved searches across all clients with stats
 */
export async function GET() {
  try {
    // Fetch all saved searches with client info
    const { data: searches, error } = await supabase
      .from('saved_searches')
      .select(`
        *,
        clients:client_id (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching searches:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 500 });
    }

    // Map to include client info
    const searchesWithClients = searches.map((search: any) => ({
      id: search.id,
      clientId: search.client_id,
      clientName: search.clients?.name,
      clientEmail: search.clients?.email,
      searchName: search.search_name,
      searchDescription: search.search_description,
      criteria: search.criteria,
      notificationFrequency: search.notification_frequency,
      notificationTime: search.notification_time,
      notificationDays: search.notification_days,
      adminShadowNotification: search.admin_shadow_notification,
      isActive: search.is_active,
      lastRunAt: search.last_run_at,
      lastMatchCount: search.last_match_count,
      createdAt: search.created_at,
    }));

    // Calculate stats
    const stats = {
      totalSearches: searches.length,
      activeSearches: searches.filter((s: any) => s.is_active).length,
      shadowNotificationsEnabled: searches.filter((s: any) => s.admin_shadow_notification).length,
      totalClients: new Set(searches.map((s: any) => s.client_id)).size,
    };

    return NextResponse.json({
      success: true,
      searches: searchesWithClients,
      stats,
    });
  } catch (error) {
    console.error('Error in admin searches API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
