// Admin API - Toggle Search Active Status
import { NextResponse } from 'next/server';
import { savedSearchService } from '@/lib/services/savedSearchService';

/**
 * POST /api/admin/searches/[id]/toggle
 * Toggle active status of a search (admin version)
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
        error: 'Failed to toggle search status',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      search,
    });
  } catch (error) {
    console.error('Error toggling search status:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
