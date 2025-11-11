// Saved Searches API - Toggle Active Status
import { NextResponse } from 'next/server';
import { savedSearchService } from '@/lib/services/savedSearchService';

/**
 * POST /api/portal/saved-searches/[id]/toggle
 * Toggle the active status of a saved search
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const searchId = params.id;

    const search = await savedSearchService.toggleSavedSearchStatus(searchId);

    if (!search) {
      return NextResponse.json({
        success: false,
        error: 'Failed to toggle saved search status',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      search,
    });
  } catch (error) {
    console.error('Error toggling saved search:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
