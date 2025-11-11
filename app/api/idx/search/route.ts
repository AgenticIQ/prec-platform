// API Route: IDX Property Search
import { NextRequest, NextResponse } from 'next/server';
import { getMockProperties } from '@/lib/services/mockData';
import { SearchCriteria } from '@/lib/types';
import { MAX_SEARCH_RESULTS } from '@/lib/constants/compliance';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { criteria, page = 1, pageSize = 50 }: {
      criteria: SearchCriteria;
      page?: number;
      pageSize?: number;
    } = body;

    // Enforce compliance: max 350 results
    const safePageSize = Math.min(pageSize, MAX_SEARCH_RESULTS);

    // TEMPORARY: Using mock data while IDX Broker API access is being set up
    // TODO: Replace with idxBrokerApi.searchProperties() once API access is enabled
    console.log('Search criteria received:', JSON.stringify(criteria, null, 2));
    const properties = getMockProperties(criteria);

    console.log(`Mock search returned ${properties.length} properties`);

    return NextResponse.json({
      success: true,
      properties,
      total: properties.length,
      page,
      pageSize: safePageSize,
    });
  } catch (error) {
    console.error('IDX search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      },
      { status: 500 }
    );
  }
}
