// Saved Searches API - List and Create
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { savedSearchService } from '@/lib/services/savedSearchService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/portal/saved-searches
 * Get all saved searches for the authenticated client
 */
export async function GET(request: Request) {
  try {
    // TODO: Get clientId from session/auth
    // For now, using a placeholder - you'll need to implement proper auth
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({
        success: false,
        error: 'Client ID required',
      }, { status: 400 });
    }

    const searches = await savedSearchService.getSavedSearchesByClient(clientId);

    return NextResponse.json({
      success: true,
      searches,
    });
  } catch (error) {
    console.error('Error fetching saved searches:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * POST /api/portal/saved-searches
 * Create a new saved search
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      clientId,
      searchName,
      searchDescription,
      criteria,
      notificationFrequency,
      notificationTime,
      notificationDays,
      adminShadowNotification,
    } = body;

    // Better error messages
    const missingFields = [];
    if (!clientId) missingFields.push('clientId');
    if (!searchName) missingFields.push('searchName');
    if (!criteria) missingFields.push('criteria');

    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        details: { missingFields, received: Object.keys(body) },
      }, { status: 400 });
    }

    const search = await savedSearchService.createSavedSearch({
      clientId,
      searchName,
      searchDescription,
      criteria,
      notificationFrequency: notificationFrequency || 'daily',
      notificationTime,
      notificationDays,
      adminShadowNotification: adminShadowNotification || false,
    });

    if (!search) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create saved search',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      search,
    });
  } catch (error) {
    console.error('Error creating saved search:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
