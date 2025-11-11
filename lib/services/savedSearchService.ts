// Saved Search Service
import { createClient } from '@supabase/supabase-js';
import { SearchCriteria } from '@/lib/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface SavedSearch {
  id: string;
  clientId: string;
  searchName: string;
  searchDescription?: string;
  criteria: SearchCriteria;
  notificationFrequency: 'realtime' | 'daily' | 'weekly' | 'monthly';
  notificationTime?: string; // '08:00' or '18:00'
  notificationDays?: string[]; // ['monday', 'wednesday', 'saturday']
  adminShadowNotification: boolean;
  isActive: boolean;
  lastRunAt?: Date;
  lastMatchCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSavedSearchInput {
  clientId: string;
  searchName: string;
  searchDescription?: string;
  criteria: SearchCriteria;
  notificationFrequency: 'realtime' | 'daily' | 'weekly' | 'monthly';
  notificationTime?: string;
  notificationDays?: string[];
  adminShadowNotification?: boolean;
}

export interface UpdateSavedSearchInput {
  searchName?: string;
  searchDescription?: string;
  criteria?: SearchCriteria;
  notificationFrequency?: 'realtime' | 'daily' | 'weekly' | 'monthly';
  notificationTime?: string;
  notificationDays?: string[];
  adminShadowNotification?: boolean;
  isActive?: boolean;
}

class SavedSearchService {
  /**
   * Create a new saved search
   */
  async createSavedSearch(input: CreateSavedSearchInput): Promise<SavedSearch | null> {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .insert({
          client_id: input.clientId,
          search_name: input.searchName,
          search_description: input.searchDescription,
          criteria: input.criteria,
          notification_frequency: input.notificationFrequency,
          notification_time: input.notificationTime,
          notification_days: input.notificationDays,
          admin_shadow_notification: input.adminShadowNotification || false,
          is_active: true,
          last_match_count: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating saved search:', error);
        return null;
      }

      return this.mapToSavedSearch(data);
    } catch (error) {
      console.error('Error creating saved search:', error);
      return null;
    }
  }

  /**
   * Get all saved searches for a client
   */
  async getSavedSearchesByClient(clientId: string): Promise<SavedSearch[]> {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved searches:', error);
        return [];
      }

      return data.map(this.mapToSavedSearch);
    } catch (error) {
      console.error('Error fetching saved searches:', error);
      return [];
    }
  }

  /**
   * Get a single saved search by ID
   */
  async getSavedSearchById(searchId: string): Promise<SavedSearch | null> {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('id', searchId)
        .single();

      if (error) {
        console.error('Error fetching saved search:', error);
        return null;
      }

      return this.mapToSavedSearch(data);
    } catch (error) {
      console.error('Error fetching saved search:', error);
      return null;
    }
  }

  /**
   * Update a saved search
   */
  async updateSavedSearch(
    searchId: string,
    updates: UpdateSavedSearchInput
  ): Promise<SavedSearch | null> {
    try {
      const updateData: any = {};

      if (updates.searchName !== undefined) updateData.search_name = updates.searchName;
      if (updates.searchDescription !== undefined) updateData.search_description = updates.searchDescription;
      if (updates.criteria !== undefined) updateData.criteria = updates.criteria;
      if (updates.notificationFrequency !== undefined) updateData.notification_frequency = updates.notificationFrequency;
      if (updates.notificationTime !== undefined) updateData.notification_time = updates.notificationTime;
      if (updates.notificationDays !== undefined) updateData.notification_days = updates.notificationDays;
      if (updates.adminShadowNotification !== undefined) updateData.admin_shadow_notification = updates.adminShadowNotification;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

      const { data, error } = await supabase
        .from('saved_searches')
        .update(updateData)
        .eq('id', searchId)
        .select()
        .single();

      if (error) {
        console.error('Error updating saved search:', error);
        return null;
      }

      return this.mapToSavedSearch(data);
    } catch (error) {
      console.error('Error updating saved search:', error);
      return null;
    }
  }

  /**
   * Delete a saved search
   */
  async deleteSavedSearch(searchId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId);

      if (error) {
        console.error('Error deleting saved search:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting saved search:', error);
      return false;
    }
  }

  /**
   * Toggle saved search active status
   */
  async toggleSavedSearchStatus(searchId: string): Promise<SavedSearch | null> {
    try {
      // Get current status
      const search = await this.getSavedSearchById(searchId);
      if (!search) return null;

      // Toggle it
      return await this.updateSavedSearch(searchId, {
        isActive: !search.isActive,
      });
    } catch (error) {
      console.error('Error toggling saved search status:', error);
      return null;
    }
  }

  /**
   * Get all active saved searches that should run now
   * Used by cron job
   */
  async getSearchesDueForExecution(): Promise<SavedSearch[]> {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });

      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching searches due for execution:', error);
        return [];
      }

      // Filter based on notification schedule
      const dueSearches = data.filter((search) => {
        const frequency = search.notification_frequency;

        // Realtime: run every hour
        if (frequency === 'realtime') {
          return true;
        }

        // Daily: check if time matches
        if (frequency === 'daily') {
          return search.notification_time === currentTime;
        }

        // Weekly: check if day and time match
        if (frequency === 'weekly') {
          const days = search.notification_days || [];
          return days.includes(currentDay) && search.notification_time === currentTime;
        }

        // Monthly: check if it's the right day of month and time
        if (frequency === 'monthly') {
          const dayOfMonth = now.getDate();
          // Run on 1st and 15th of month
          return (dayOfMonth === 1 || dayOfMonth === 15) && search.notification_time === currentTime;
        }

        return false;
      });

      return dueSearches.map(this.mapToSavedSearch);
    } catch (error) {
      console.error('Error fetching searches due for execution:', error);
      return [];
    }
  }

  /**
   * Update last run timestamp and match count
   */
  async updateSearchRunMetrics(searchId: string, matchCount: number): Promise<void> {
    try {
      await supabase
        .from('saved_searches')
        .update({
          last_run_at: new Date().toISOString(),
          last_match_count: matchCount,
        })
        .eq('id', searchId);
    } catch (error) {
      console.error('Error updating search run metrics:', error);
    }
  }

  /**
   * Get saved searches with shadow notifications enabled
   */
  async getSearchesWithShadowNotification(): Promise<SavedSearch[]> {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('admin_shadow_notification', true)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching searches with shadow notification:', error);
        return [];
      }

      return data.map(this.mapToSavedSearch);
    } catch (error) {
      console.error('Error fetching searches with shadow notification:', error);
      return [];
    }
  }

  /**
   * Map database row to SavedSearch object
   */
  private mapToSavedSearch(data: any): SavedSearch {
    return {
      id: data.id,
      clientId: data.client_id,
      searchName: data.search_name,
      searchDescription: data.search_description,
      criteria: data.criteria,
      notificationFrequency: data.notification_frequency,
      notificationTime: data.notification_time,
      notificationDays: data.notification_days,
      adminShadowNotification: data.admin_shadow_notification,
      isActive: data.is_active,
      lastRunAt: data.last_run_at ? new Date(data.last_run_at) : undefined,
      lastMatchCount: data.last_match_count,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

export const savedSearchService = new SavedSearchService();
