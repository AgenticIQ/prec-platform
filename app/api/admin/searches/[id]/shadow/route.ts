// Admin API - Toggle Shadow Notification
import { NextResponse } from 'next/server';
import { savedSearchService } from '@/lib/services/savedSearchService';

/**
 * POST /api/admin/searches/[id]/shadow
 * Toggle admin shadow notification for a search
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchId = id;

    // Get current search
    const search = await savedSearchService.getSavedSearchById(searchId);
    if (!search) {
      return NextResponse.json({
        success: false,
        error: 'Search not found',
      }, { status: 404 });
    }

    // Toggle shadow notification
    const updated = await savedSearchService.updateSavedSearch(searchId, {
      adminShadowNotification: !search.adminShadowNotification,
    });

    if (!updated) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update shadow notification',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      search: updated,
    });
  } catch (error) {
    console.error('Error toggling shadow notification:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
