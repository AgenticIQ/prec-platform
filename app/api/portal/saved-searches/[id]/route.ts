// Saved Searches API - Individual Search Operations
import { NextResponse } from 'next/server';
import { savedSearchService } from '@/lib/services/savedSearchService';

/**
 * PUT /api/portal/saved-searches/[id]
 * Update a saved search
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const searchId = params.id;

    const search = await savedSearchService.updateSavedSearch(searchId, body);

    if (!search) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update saved search',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      search,
    });
  } catch (error) {
    console.error('Error updating saved search:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * DELETE /api/portal/saved-searches/[id]
 * Delete a saved search
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const searchId = params.id;

    const success = await savedSearchService.deleteSavedSearch(searchId);

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete saved search',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting saved search:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
