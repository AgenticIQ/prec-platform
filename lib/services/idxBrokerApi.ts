// IDX Broker API Service
import { Property, SearchCriteria } from '@/lib/types';

const IDX_BROKER_API_KEY = process.env.IDX_BROKER_API_KEY || '';
const IDX_BROKER_BASE_URL = 'https://api.idxbroker.com';

interface IdxBrokerResponse {
  success: boolean;
  data?: any;
  error?: string;
  total?: number;
}

/**
 * IDX Broker API Client
 * Documentation: https://middleware.idxbroker.com/docs/api/
 */
class IdxBrokerApiService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = IDX_BROKER_BASE_URL;
    this.apiKey = IDX_BROKER_API_KEY;
  }

  /**
   * Make authenticated request to IDX Broker API
   */
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'accesskey': this.apiKey,
          'outputtype': 'json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`IDX Broker API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('IDX Broker API request error:', error);
      throw error;
    }
  }

  /**
   * Search properties using IDX Broker search API
   */
  async searchProperties(
    criteria: SearchCriteria,
    page: number = 1,
    pageSize: number = 50
  ): Promise<IdxBrokerResponse> {
    try {
      // Build query parameters
      const params = new URLSearchParams();

      // IDX Broker uses different parameter names
      if (criteria.cities && criteria.cities.length > 0) {
        params.append('city', criteria.cities.join(','));
      }

      if (criteria.minPrice) {
        params.append('minprice', criteria.minPrice.toString());
      }

      if (criteria.maxPrice) {
        params.append('maxprice', criteria.maxPrice.toString());
      }

      if (criteria.propertyTypes && criteria.propertyTypes.length > 0) {
        // Map property types to IDX Broker types
        const idxTypes = criteria.propertyTypes.map(type => {
          switch (type.toLowerCase()) {
            case 'single family': return 'SFR';
            case 'townhouse': return 'TH';
            case 'condo/apartment': return 'CND';
            case 'multi-family': return 'MUL';
            case 'vacant land': return 'LND';
            default: return type;
          }
        });
        params.append('propertytype', idxTypes.join(','));
      }

      if (criteria.minBedrooms) {
        params.append('bedrooms', criteria.minBedrooms.toString() + '+');
      }

      if (criteria.minBathrooms) {
        params.append('bathrooms', criteria.minBathrooms.toString() + '+');
      }

      if (criteria.minSquareFeet) {
        params.append('sqft', criteria.minSquareFeet.toString() + '+');
      }

      // Add pagination
      params.append('limit', Math.min(pageSize, 350).toString());
      params.append('offset', ((page - 1) * pageSize).toString());

      // Use the clients/search endpoint for basic search
      // or /partners/listingssearch for advanced search
      const endpoint = `/clients/search?${params.toString()}`;
      const data = await this.makeRequest(endpoint);

      // Transform IDX Broker response to our Property format
      const properties = Array.isArray(data)
        ? data.map(listing => this.transformIdxBrokerProperty(listing))
        : [];

      return {
        success: true,
        data: properties,
        total: properties.length,
      };
    } catch (error) {
      console.error('IDX Broker search error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Fetch all active listings for daily refresh
   */
  async fetchAllActiveListings(): Promise<IdxBrokerResponse> {
    try {
      // Get all featured/active listings
      // IDX Broker has multiple endpoints - using featured as a starting point
      const endpoints = [
        '/clients/featured',
        '/clients/sold', // Include sold for VOW
      ];

      let allListings: any[] = [];

      for (const endpoint of endpoints) {
        try {
          const data = await this.makeRequest(endpoint);
          if (Array.isArray(data)) {
            allListings = [...allListings, ...data];
          }
        } catch (error) {
          console.error(`Error fetching from ${endpoint}:`, error);
        }
      }

      // Remove duplicates by listingID
      const uniqueListings = Array.from(
        new Map(allListings.map(item => [item.listingID, item])).values()
      );

      const properties = uniqueListings.map(listing =>
        this.transformIdxBrokerProperty(listing)
      );

      return {
        success: true,
        data: properties,
        total: properties.length,
      };
    } catch (error) {
      console.error('IDX Broker fetch all error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get single property by MLS number
   */
  async getPropertyByMlsNumber(mlsNumber: string): Promise<IdxBrokerResponse> {
    try {
      const endpoint = `/clients/listing/${mlsNumber}`;
      const data = await this.makeRequest(endpoint);

      if (!data || data.error) {
        return {
          success: false,
          error: 'Property not found',
        };
      }

      return {
        success: true,
        data: this.transformIdxBrokerProperty(data),
      };
    } catch (error) {
      console.error('IDX Broker get property error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Transform IDX Broker listing to our Property type
   */
  private transformIdxBrokerProperty(listing: any): Property {
    // IDX Broker field mapping
    return {
      id: listing.listingID || listing.idxID,
      mlsNumber: listing.listingID || listing.idxID,
      listingBrokerage: listing.coListingOfficeName || listing.listingOfficeName || 'Unknown',
      address: listing.address || listing.streetNumber + ' ' + listing.streetName,
      city: listing.cityName || listing.city || '',
      province: listing.state || 'BC',
      postalCode: listing.zipcode || listing.postalCode || '',
      price: parseInt(listing.listPrice || listing.price || '0'),
      propertyType: this.mapPropertyType(listing.propType || listing.propertyType),
      bedrooms: parseInt(listing.bedrooms || '0') || undefined,
      bathrooms: parseFloat(listing.totalBaths || listing.bathrooms || '0') || undefined,
      squareFeet: parseInt(listing.sqFt || listing.livingArea || '0') || undefined,
      lotSize: parseInt(listing.acres || '0') || undefined,
      yearBuilt: parseInt(listing.yearBuilt || '0') || undefined,
      description: listing.remarks || listing.listingDescription || '',
      features: this.parseFeatures(listing),
      photos: this.parsePhotos(listing),
      latitude: parseFloat(listing.latitude || listing.lat || '0'),
      longitude: parseFloat(listing.longitude || listing.lng || '0'),
      status: this.mapStatus(listing.propStatus || listing.status),
      listingDate: new Date(listing.dateAdded || listing.listingDate || Date.now()),
      lastUpdated: new Date(listing.updated || listing.modifiedDate || Date.now()),
      permitIDX: true, // IDX Broker only shows permitted listings
    };
  }

  /**
   * Map IDX Broker property type to our standard types
   */
  private mapPropertyType(idxType: string): string {
    const typeMap: { [key: string]: string } = {
      'SFR': 'Single Family',
      'TH': 'Townhouse',
      'CND': 'Condo/Apartment',
      'MUL': 'Multi-Family',
      'LND': 'Vacant Land',
      'MH': 'Manufactured/Mobile',
    };

    return typeMap[idxType] || idxType || 'Residential';
  }

  /**
   * Map IDX Broker status to our standard statuses
   */
  private mapStatus(idxStatus: string): 'Active' | 'Pending' | 'Sold' | 'Expired' | 'Withdrawn' {
    const statusMap: { [key: string]: any } = {
      'active': 'Active',
      'pending': 'Pending',
      'sold': 'Sold',
      'expired': 'Expired',
      'withdrawn': 'Withdrawn',
      'contingent': 'Pending',
    };

    return statusMap[idxStatus?.toLowerCase()] || 'Active';
  }

  /**
   * Parse features from IDX Broker listing
   */
  private parseFeatures(listing: any): string[] {
    const features: string[] = [];

    if (listing.garage) features.push(`${listing.garage} car garage`);
    if (listing.pool === 'Y' || listing.pool === true) features.push('Pool');
    if (listing.waterfront === 'Y' || listing.waterfront === true) features.push('Waterfront');
    if (listing.fireplace === 'Y' || listing.fireplace === true) features.push('Fireplace');
    if (listing.basement === 'Y' || listing.basement === true) features.push('Basement');

    // Add any custom features from remarks or features field
    if (listing.features) {
      const customFeatures = Array.isArray(listing.features)
        ? listing.features
        : listing.features.split(',').map((f: string) => f.trim());
      features.push(...customFeatures);
    }

    return features;
  }

  /**
   * Parse photos from IDX Broker listing
   */
  private parsePhotos(listing: any): Array<{ url: string; caption?: string; order: number }> {
    const photos: Array<{ url: string; caption?: string; order: number }> = [];

    // IDX Broker provides image array or single image
    if (listing.image) {
      if (Array.isArray(listing.image)) {
        listing.image.forEach((img: any, index: number) => {
          photos.push({
            url: typeof img === 'string' ? img : img.url,
            caption: typeof img === 'object' ? img.caption : undefined,
            order: index,
          });
        });
      } else {
        photos.push({
          url: listing.image,
          order: 0,
        });
      }
    }

    // Fallback to featured image
    if (photos.length === 0 && listing.featuredImage) {
      photos.push({
        url: listing.featuredImage,
        order: 0,
      });
    }

    return photos;
  }
}

export const idxBrokerApi = new IdxBrokerApiService();
