// Search Service - Match listings to saved searches
import { getServiceSupabase } from '@/lib/supabase/client';
import { Property, SavedSearch, SearchCriteria } from '@/lib/types';
import { MAX_SEARCH_RESULTS } from '@/lib/constants/compliance';

/**
 * Search Service for matching properties to criteria
 */
class SearchService {
  /**
   * Search properties in database by criteria
   */
  async searchProperties(
    criteria: SearchCriteria,
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ properties: Property[]; total: number }> {
    const supabase = getServiceSupabase();

    // Build query
    let query = supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('status', 'Active')
      .eq('permit_idx', true);

    // Apply filters based on criteria
    if (criteria.cities && criteria.cities.length > 0) {
      query = query.in('city', criteria.cities);
    }

    if (criteria.minPrice) {
      query = query.gte('price', criteria.minPrice);
    }

    if (criteria.maxPrice) {
      query = query.lte('price', criteria.maxPrice);
    }

    if (criteria.propertyTypes && criteria.propertyTypes.length > 0) {
      query = query.in('property_type', criteria.propertyTypes);
    }

    if (criteria.minBedrooms) {
      query = query.gte('bedrooms', criteria.minBedrooms);
    }

    if (criteria.minBathrooms) {
      query = query.gte('bathrooms', criteria.minBathrooms);
    }

    if (criteria.minSquareFeet) {
      query = query.gte('square_feet', criteria.minSquareFeet);
    }

    if (criteria.maxSquareFeet) {
      query = query.lte('square_feet', criteria.maxSquareFeet);
    }

    // Apply pagination (max 350 per compliance)
    const limit = Math.min(pageSize, MAX_SEARCH_RESULTS);
    const offset = (page - 1) * limit;

    query = query
      .order('listing_date', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Search error:', error);
      throw new Error('Failed to search properties');
    }

    return {
      properties: (data || []).map(this.transformDbToProperty),
      total: count || 0,
    };
  }

  /**
   * Find new listings that match a saved search since last notification
   */
  async findNewMatchingListings(
    search: SavedSearch
  ): Promise<Property[]> {
    const supabase = getServiceSupabase();

    // Build query based on saved search criteria
    let query = supabase
      .from('listings')
      .select('*')
      .eq('status', 'Active')
      .eq('permit_idx', true);

    // Only get listings added since last notification
    if (search.lastNotified) {
      query = query.gt('listing_date', search.lastNotified.toISOString());
    }

    // Apply search criteria filters
    const criteria = search.criteria;

    if (criteria.cities && criteria.cities.length > 0) {
      query = query.in('city', criteria.cities);
    }

    if (criteria.minPrice) {
      query = query.gte('price', criteria.minPrice);
    }

    if (criteria.maxPrice) {
      query = query.lte('price', criteria.maxPrice);
    }

    if (criteria.propertyTypes && criteria.propertyTypes.length > 0) {
      query = query.in('property_type', criteria.propertyTypes);
    }

    if (criteria.minBedrooms) {
      query = query.gte('bedrooms', criteria.minBedrooms);
    }

    if (criteria.minBathrooms) {
      query = query.gte('bathrooms', criteria.minBathrooms);
    }

    if (criteria.minSquareFeet) {
      query = query.gte('square_feet', criteria.minSquareFeet);
    }

    if (criteria.maxSquareFeet) {
      query = query.lte('square_feet', criteria.maxSquareFeet);
    }

    // Limit results (compliance requirement)
    query = query
      .order('listing_date', { ascending: false })
      .limit(MAX_SEARCH_RESULTS);

    const { data, error } = await query;

    if (error) {
      console.error('Find matching listings error:', error);
      return [];
    }

    return (data || []).map(this.transformDbToProperty);
  }

  /**
   * Get property by MLS number
   */
  async getPropertyByMlsNumber(mlsNumber: string): Promise<Property | null> {
    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('mls_number', mlsNumber)
      .single();

    if (error || !data) {
      return null;
    }

    return this.transformDbToProperty(data);
  }

  /**
   * Get properties by multiple MLS numbers
   */
  async getPropertiesByMlsNumbers(mlsNumbers: string[]): Promise<Property[]> {
    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .in('mls_number', mlsNumbers);

    if (error) {
      console.error('Get properties error:', error);
      return [];
    }

    return (data || []).map(this.transformDbToProperty);
  }

  /**
   * Transform database record to Property type
   */
  private transformDbToProperty(record: any): Property {
    return {
      id: record.id,
      mlsNumber: record.mls_number,
      listingBrokerage: record.listing_brokerage,
      address: record.address,
      city: record.city,
      province: record.province,
      postalCode: record.postal_code,
      price: record.price,
      propertyType: record.property_type,
      bedrooms: record.bedrooms,
      bathrooms: record.bathrooms,
      squareFeet: record.square_feet,
      lotSize: record.lot_size,
      yearBuilt: record.year_built,
      description: record.description,
      features: record.features || [],
      photos: record.photos || [],
      latitude: record.latitude,
      longitude: record.longitude,
      status: record.status,
      listingDate: new Date(record.listing_date),
      lastUpdated: new Date(record.last_updated),
      permitIDX: record.permit_idx,
    };
  }

  /**
   * Transform Property to database record
   */
  transformPropertyToDb(property: Property): any {
    return {
      mls_number: property.mlsNumber,
      listing_brokerage: property.listingBrokerage,
      address: property.address,
      city: property.city,
      province: property.province,
      postal_code: property.postalCode,
      price: property.price,
      property_type: property.propertyType,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      square_feet: property.squareFeet,
      lot_size: property.lotSize,
      year_built: property.yearBuilt,
      description: property.description,
      features: property.features,
      photos: property.photos,
      latitude: property.latitude,
      longitude: property.longitude,
      status: property.status,
      listing_date: property.listingDate.toISOString(),
      last_updated: new Date().toISOString(),
      permit_idx: property.permitIDX,
    };
  }
}

export const searchService = new SearchService();
