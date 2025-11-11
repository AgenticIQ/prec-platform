// Cron Job - Execute Saved Searches and Send Notifications
import { NextResponse } from 'next/server';
import { searchExecutionService } from '@/lib/services/searchExecutionService';

const CRON_SECRET = process.env.CRON_SECRET || '';

/**
 * GET /api/cron/search-notifications
 * Executes all saved searches that are due to run
 *
 * This endpoint should be called by a cron scheduler (e.g., Vercel Cron, GitHub Actions, etc.)
 * Recommended schedule: Every hour (0 * * * *)
 *
 * Security: Requires CRON_SECRET in Authorization header or query param
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret for security
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    const secretFromQuery = searchParams.get('secret');
    const secretFromHeader = authHeader?.replace('Bearer ', '');

    const providedSecret = secretFromQuery || secretFromHeader;

    if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
      console.error('Invalid cron secret');
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    console.log('Starting cron job: search-notifications');
    const startTime = Date.now();

    // Execute all due searches
    const result = await searchExecutionService.executeDueSearches();

    const duration = Date.now() - startTime;

    console.log(`Cron job completed in ${duration}ms:`, result);

    return NextResponse.json({
      success: true,
      message: 'Cron job completed successfully',
      stats: {
        executed: result.executed,
        totalMatches: result.matches,
        errors: result.errors,
        duration: `${duration}ms`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * POST /api/cron/search-notifications (with body)
 * Manually trigger execution of specific search
 * Used for testing
 */
export async function POST(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const secretFromHeader = authHeader?.replace('Bearer ', '');

    if (!CRON_SECRET || secretFromHeader !== CRON_SECRET) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 });
    }

    const body = await request.json();
    const { searchId } = body;

    if (searchId) {
      // Execute specific search
      const result = await searchExecutionService.executeSearchById(searchId);
      return NextResponse.json({
        success: result.success,
        message: result.success
          ? `Search executed successfully. Found ${result.matches} new properties.`
          : 'Search execution failed',
        matches: result.matches,
        error: result.error,
      });
    } else {
      // Execute all due searches
      const result = await searchExecutionService.executeDueSearches();
      return NextResponse.json({
        success: true,
        message: 'All searches executed',
        stats: result,
      });
    }
  } catch (error) {
    console.error('Manual execution error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
