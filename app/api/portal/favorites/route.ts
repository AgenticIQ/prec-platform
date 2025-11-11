// Property Favorites API
import { NextResponse } from 'next/server';
import { propertyPreferenceService, PropertyCategory } from '@/lib/services/propertyPreferenceService';

/**
 * GET /api/portal/favorites
 * Get all property favorites for a client, optionally filtered by category
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const category = searchParams.get('category') as PropertyCategory | null;

    if (!clientId) {
      return NextResponse.json({
        success: false,
        error: 'Client ID required',
      }, { status: 400 });
    }

    const preferences = await propertyPreferenceService.getPreferencesByClient(
      clientId,
      category || undefined
    );

    const counts = await propertyPreferenceService.getPreferenceCounts(clientId);

    return NextResponse.json({
      success: true,
      preferences,
      counts,
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * POST /api/portal/favorites
 * Rate a property (Love/Like/Leave)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, property, category, notes } = body;

    if (!clientId || !property || !category) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
      }, { status: 400 });
    }

    if (!['love', 'like', 'leave'].includes(category)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid category. Must be love, like, or leave',
      }, { status: 400 });
    }

    const preference = await propertyPreferenceService.setPreference({
      clientId,
      property,
      category,
      notes,
    });

    if (!preference) {
      return NextResponse.json({
        success: false,
        error: 'Failed to save preference',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      preference,
    });
  } catch (error) {
    console.error('Error saving preference:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * DELETE /api/portal/favorites
 * Remove a property rating
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const mlsNumber = searchParams.get('mlsNumber');

    if (!clientId || !mlsNumber) {
      return NextResponse.json({
        success: false,
        error: 'Client ID and MLS number required',
      }, { status: 400 });
    }

    const success = await propertyPreferenceService.deletePreference(clientId, mlsNumber);

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete preference',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting preference:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
