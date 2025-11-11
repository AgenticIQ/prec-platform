// Property Preference Service (Love It! / Like It! / Leave It!!!)
import { createClient } from '@supabase/supabase-js';
import { Property } from '@/lib/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export type PropertyCategory = 'love' | 'like' | 'leave';

export interface PropertyPreference {
  id: string;
  clientId: string;
  propertyMlsNumber: string;
  propertyAddress: string;
  propertyData: Property;
  category: PropertyCategory;
  clientNotes?: string;
  firstViewedAt: Date;
  lastViewedAt: Date;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SetPreferenceInput {
  clientId: string;
  property: Property;
  category: PropertyCategory;
  notes?: string;
}

class PropertyPreferenceService {
  /**
   * Set or update a property preference
   */
  async setPreference(input: SetPreferenceInput): Promise<PropertyPreference | null> {
    try {
      // Check if preference already exists
      const existing = await this.getPreference(input.clientId, input.property.mlsNumber);

      if (existing) {
        // Update existing preference
        const { data, error } = await supabase
          .from('property_favorites')
          .update({
            category: input.category,
            client_notes: input.notes,
            last_viewed_at: new Date().toISOString(),
            view_count: existing.viewCount + 1,
            property_data: input.property, // Update cached property data
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating property preference:', error);
          return null;
        }

        return this.mapToPropertyPreference(data);
      } else {
        // Create new preference
        const { data, error } = await supabase
          .from('property_favorites')
          .insert({
            client_id: input.clientId,
            property_mls_number: input.property.mlsNumber,
            property_address: input.property.address,
            property_data: input.property,
            category: input.category,
            client_notes: input.notes,
            view_count: 1,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating property preference:', error);
          return null;
        }

        return this.mapToPropertyPreference(data);
      }
    } catch (error) {
      console.error('Error setting property preference:', error);
      return null;
    }
  }

  /**
   * Get a single property preference
   */
  async getPreference(clientId: string, mlsNumber: string): Promise<PropertyPreference | null> {
    try {
      const { data, error } = await supabase
        .from('property_favorites')
        .select('*')
        .eq('client_id', clientId)
        .eq('property_mls_number', mlsNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - not an error
          return null;
        }
        console.error('Error fetching property preference:', error);
        return null;
      }

      return this.mapToPropertyPreference(data);
    } catch (error) {
      console.error('Error fetching property preference:', error);
      return null;
    }
  }

  /**
   * Get all property preferences for a client
   */
  async getPreferencesByClient(
    clientId: string,
    category?: PropertyCategory
  ): Promise<PropertyPreference[]> {
    try {
      let query = supabase
        .from('property_favorites')
        .select('*')
        .eq('client_id', clientId)
        .order('last_viewed_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching property preferences:', error);
        return [];
      }

      return data.map(this.mapToPropertyPreference);
    } catch (error) {
      console.error('Error fetching property preferences:', error);
      return [];
    }
  }

  /**
   * Get preference counts for a client
   */
  async getPreferenceCounts(clientId: string): Promise<{
    love: number;
    like: number;
    leave: number;
    total: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('property_favorites')
        .select('category')
        .eq('client_id', clientId);

      if (error) {
        console.error('Error fetching preference counts:', error);
        return { love: 0, like: 0, leave: 0, total: 0 };
      }

      const counts = {
        love: data.filter((p) => p.category === 'love').length,
        like: data.filter((p) => p.category === 'like').length,
        leave: data.filter((p) => p.category === 'leave').length,
        total: data.length,
      };

      return counts;
    } catch (error) {
      console.error('Error fetching preference counts:', error);
      return { love: 0, like: 0, leave: 0, total: 0 };
    }
  }

  /**
   * Delete a property preference
   */
  async deletePreference(clientId: string, mlsNumber: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('property_favorites')
        .delete()
        .eq('client_id', clientId)
        .eq('property_mls_number', mlsNumber);

      if (error) {
        console.error('Error deleting property preference:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting property preference:', error);
      return false;
    }
  }

  /**
   * Update client notes for a property
   */
  async updateNotes(clientId: string, mlsNumber: string, notes: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('property_favorites')
        .update({
          client_notes: notes,
        })
        .eq('client_id', clientId)
        .eq('property_mls_number', mlsNumber);

      if (error) {
        console.error('Error updating property notes:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating property notes:', error);
      return false;
    }
  }

  /**
   * Track property view (increment view count)
   */
  async trackView(clientId: string, mlsNumber: string): Promise<void> {
    try {
      const existing = await this.getPreference(clientId, mlsNumber);

      if (existing) {
        await supabase
          .from('property_favorites')
          .update({
            last_viewed_at: new Date().toISOString(),
            view_count: existing.viewCount + 1,
          })
          .eq('id', existing.id);
      }
    } catch (error) {
      console.error('Error tracking property view:', error);
    }
  }

  /**
   * Get "Love It!" properties for a client (shorthand)
   */
  async getLoveItProperties(clientId: string): Promise<PropertyPreference[]> {
    return this.getPreferencesByClient(clientId, 'love');
  }

  /**
   * Get "Like It!" properties for a client (shorthand)
   */
  async getLikeItProperties(clientId: string): Promise<PropertyPreference[]> {
    return this.getPreferencesByClient(clientId, 'like');
  }

  /**
   * Get "Leave It!!!" properties for a client (shorthand)
   */
  async getLeaveItProperties(clientId: string): Promise<PropertyPreference[]> {
    return this.getPreferencesByClient(clientId, 'leave');
  }

  /**
   * Bulk get preferences for multiple properties
   */
  async getBulkPreferences(
    clientId: string,
    mlsNumbers: string[]
  ): Promise<Map<string, PropertyCategory>> {
    try {
      const { data, error } = await supabase
        .from('property_favorites')
        .select('property_mls_number, category')
        .eq('client_id', clientId)
        .in('property_mls_number', mlsNumbers);

      if (error) {
        console.error('Error fetching bulk preferences:', error);
        return new Map();
      }

      const preferencesMap = new Map<string, PropertyCategory>();
      data.forEach((pref) => {
        preferencesMap.set(pref.property_mls_number, pref.category);
      });

      return preferencesMap;
    } catch (error) {
      console.error('Error fetching bulk preferences:', error);
      return new Map();
    }
  }

  /**
   * Map database row to PropertyPreference object
   */
  private mapToPropertyPreference(data: any): PropertyPreference {
    return {
      id: data.id,
      clientId: data.client_id,
      propertyMlsNumber: data.property_mls_number,
      propertyAddress: data.property_address,
      propertyData: data.property_data,
      category: data.category,
      clientNotes: data.client_notes,
      firstViewedAt: new Date(data.first_viewed_at),
      lastViewedAt: new Date(data.last_viewed_at),
      viewCount: data.view_count,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

export const propertyPreferenceService = new PropertyPreferenceService();
