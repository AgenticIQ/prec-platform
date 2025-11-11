// Test Supabase Connection
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    const supabase = getServiceSupabase();

    // Test 1: Check connection by querying clients table
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('count')
      .limit(1);

    if (clientsError) {
      return NextResponse.json({
        success: false,
        error: `Clients table error: ${clientsError.message}`,
        details: clientsError,
      }, { status: 500 });
    }

    // Test 2: Check saved_searches table
    const { data: searches, error: searchesError } = await supabase
      .from('saved_searches')
      .select('count')
      .limit(1);

    if (searchesError) {
      return NextResponse.json({
        success: false,
        error: `Saved searches table error: ${searchesError.message}`,
        details: searchesError,
      }, { status: 500 });
    }

    // Test 3: Check listings table
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('count')
      .limit(1);

    if (listingsError) {
      return NextResponse.json({
        success: false,
        error: `Listings table error: ${listingsError.message}`,
        details: listingsError,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful!',
      tables: {
        clients: 'OK',
        saved_searches: 'OK',
        listings: 'OK',
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
