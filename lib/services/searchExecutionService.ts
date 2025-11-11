// Search Execution Service - Runs saved searches and sends notifications
import { savedSearchService, SavedSearch } from './savedSearchService';
import { idxBrokerApi } from './idxBrokerApi';
import { notificationService } from './notificationService';
import { createClient } from '@supabase/supabase-js';
import { Property, SearchCriteria } from '@/lib/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminEmail = process.env.ADMIN_EMAIL!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

class SearchExecutionService {
  /**
   * Execute all searches that are due to run now
   */
  async executeDueSearches(): Promise<{
    executed: number;
    matches: number;
    errors: number;
  }> {
    try {
      // Get all searches that should run now
      const searches = await savedSearchService.getSearchesDueForExecution();

      console.log(`Found ${searches.length} searches due for execution`);

      let executed = 0;
      let totalMatches = 0;
      let errors = 0;

      for (const search of searches) {
        try {
          const matchCount = await this.executeSearch(search);
          executed++;
          totalMatches += matchCount;
        } catch (error) {
          console.error(`Error executing search ${search.id}:`, error);
          errors++;
        }
      }

      return { executed, matches: totalMatches, errors };
    } catch (error) {
      console.error('Error in executeDueSearches:', error);
      return { executed: 0, matches: 0, errors: 1 };
    }
  }

  /**
   * Execute a single saved search
   */
  async executeSearch(search: SavedSearch): Promise<number> {
    try {
      console.log(`Executing search: ${search.searchName} (${search.id})`);

      // Get new properties since last run
      const newProperties = await this.getNewPropertiesSinceLastRun(
        search.criteria,
        search.lastRunAt
      );

      console.log(`Found ${newProperties.length} new properties for search ${search.id}`);

      // Update search metrics
      await savedSearchService.updateSearchRunMetrics(search.id, newProperties.length);

      // If no new properties, no need to send notification
      if (newProperties.length === 0) {
        return 0;
      }

      // Get client info
      const client = await this.getClient(search.clientId);
      if (!client) {
        console.error(`Client not found for search ${search.id}`);
        return 0;
      }

      // Send notification to client
      await this.sendSearchNotification(search, client, newProperties);

      // Send shadow notification to admin if enabled
      if (search.adminShadowNotification) {
        await this.sendAdminShadowNotification(search, client, newProperties);
      }

      // Log the notification
      await this.logNotification(search, newProperties);

      return newProperties.length;
    } catch (error) {
      console.error(`Error executing search ${search.id}:`, error);
      throw error;
    }
  }

  /**
   * Get new properties that match criteria since last run
   */
  private async getNewPropertiesSinceLastRun(
    criteria: SearchCriteria,
    lastRunAt?: Date
  ): Promise<Property[]> {
    try {
      // Search IDX Broker API
      const result = await idxBrokerApi.searchProperties(criteria, 1, 350);

      if (!result.success || !result.data) {
        return [];
      }

      let properties = result.data as Property[];

      // Filter to only new properties (listed after last run)
      if (lastRunAt) {
        const lastRunDate = new Date(lastRunAt);
        properties = properties.filter((prop) => {
          return new Date(prop.listingDate) > lastRunDate;
        });
      }

      return properties;
    } catch (error) {
      console.error('Error getting new properties:', error);
      return [];
    }
  }

  /**
   * Get client by ID
   */
  private async getClient(clientId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) {
        console.error('Error fetching client:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching client:', error);
      return null;
    }
  }

  /**
   * Send notification email to client
   */
  private async sendSearchNotification(
    search: SavedSearch,
    client: any,
    properties: Property[]
  ): Promise<void> {
    try {
      await notificationService.sendSearchNotification(client, search, properties);
    } catch (error) {
      console.error('Error sending search notification:', error);
    }
  }

  /**
   * Send shadow notification to admin
   */
  private async sendAdminShadowNotification(
    search: SavedSearch,
    client: any,
    properties: Property[]
  ): Promise<void> {
    try {
      // Send to admin email with context about which client this is for
      await notificationService.sendAdminShadowNotification(
        adminEmail,
        client,
        search,
        properties
      );
    } catch (error) {
      console.error('Error sending admin shadow notification:', error);
    }
  }

  /**
   * Log notification in database
   */
  private async logNotification(
    search: SavedSearch,
    properties: Property[]
  ): Promise<void> {
    try {
      const mlsNumbers = properties.map((p) => p.mlsNumber);

      await supabase.from('search_notifications_log').insert({
        saved_search_id: search.id,
        client_id: search.clientId,
        properties_sent: mlsNumbers,
        property_count: properties.length,
        admin_notified: search.adminShadowNotification,
        email_subject: `${properties.length} New ${properties.length === 1 ? 'Property' : 'Properties'} - ${search.searchName}`,
        notification_type: 'automated',
      });
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }

  /**
   * Manual execution of a specific search (for testing)
   */
  async executeSearchById(searchId: string): Promise<{
    success: boolean;
    matches: number;
    error?: string;
  }> {
    try {
      const search = await savedSearchService.getSavedSearchById(searchId);

      if (!search) {
        return { success: false, matches: 0, error: 'Search not found' };
      }

      const matches = await this.executeSearch(search);

      return { success: true, matches };
    } catch (error) {
      console.error('Error in executeSearchById:', error);
      return {
        success: false,
        matches: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const searchExecutionService = new SearchExecutionService();
