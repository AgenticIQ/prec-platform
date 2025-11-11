// Follow Up Boss CRM Integration
import { Client } from '@/lib/types';

const FOLLOW_UP_BOSS_API_KEY = process.env.FOLLOW_UP_BOSS_API_KEY || '';
const FOLLOW_UP_BOSS_BASE_URL = 'https://api.followupboss.com/v1';

interface FollowUpBossLead {
  firstName: string;
  lastName?: string;
  emails: { value: string }[];
  phones?: { value: string }[];
  source?: string;
  tags?: string[];
}

/**
 * Follow Up Boss Service for CRM integration
 */
class FollowUpBossService {
  /**
   * Create a new lead in Follow Up Boss
   */
  async createLead(client: Client, metadata?: Record<string, any>): Promise<boolean> {
    if (!FOLLOW_UP_BOSS_API_KEY) {
      console.warn('Follow Up Boss API key not configured - skipping lead creation');
      return false;
    }

    try {
      // Parse name into first and last
      const nameParts = client.name.trim().split(' ');
      const firstName = nameParts[0] || client.name;
      const lastName = nameParts.slice(1).join(' ') || undefined;

      const leadData: FollowUpBossLead = {
        firstName,
        lastName,
        emails: [{ value: client.email }],
        phones: client.phone ? [{ value: client.phone }] : [],
        source: 'PREC Real Estate Website',
        tags: ['Website Registration', 'Client Portal'],
      };

      const response = await fetch(`${FOLLOW_UP_BOSS_BASE_URL}/people`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(FOLLOW_UP_BOSS_API_KEY + ':').toString('base64')}`,
        },
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Follow Up Boss API error:', response.status, errorText);
        return false;
      }

      const result = await response.json();
      console.log(`Created Follow Up Boss lead for ${client.email}:`, result.id);
      return true;
    } catch (error) {
      console.error('Error creating Follow Up Boss lead:', error);
      return false;
    }
  }

  /**
   * Update a lead in Follow Up Boss (by email)
   */
  async updateLead(email: string, updates: Partial<FollowUpBossLead>): Promise<boolean> {
    if (!FOLLOW_UP_BOSS_API_KEY) {
      console.warn('Follow Up Boss API key not configured');
      return false;
    }

    try {
      // Follow Up Boss uses email as unique identifier for updates
      const response = await fetch(`${FOLLOW_UP_BOSS_BASE_URL}/people`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(FOLLOW_UP_BOSS_API_KEY + ':').toString('base64')}`,
        },
        body: JSON.stringify({
          emails: [{ value: email }],
          ...updates,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Follow Up Boss update error:', response.status, errorText);
        return false;
      }

      console.log(`Updated Follow Up Boss lead: ${email}`);
      return true;
    } catch (error) {
      console.error('Error updating Follow Up Boss lead:', error);
      return false;
    }
  }

  /**
   * Add a note to a lead in Follow Up Boss
   */
  async addNote(email: string, note: string): Promise<boolean> {
    if (!FOLLOW_UP_BOSS_API_KEY) {
      console.warn('Follow Up Boss API key not configured');
      return false;
    }

    try {
      // First, find the person by email
      const searchResponse = await fetch(`${FOLLOW_UP_BOSS_BASE_URL}/people?email=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(FOLLOW_UP_BOSS_API_KEY + ':').toString('base64')}`,
        },
      });

      if (!searchResponse.ok) {
        console.error('Failed to find person in Follow Up Boss');
        return false;
      }

      const searchResult = await searchResponse.json();
      const personId = searchResult.people?.[0]?.id;

      if (!personId) {
        console.error('Person not found in Follow Up Boss');
        return false;
      }

      // Add note to the person
      const noteResponse = await fetch(`${FOLLOW_UP_BOSS_BASE_URL}/people/${personId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(FOLLOW_UP_BOSS_API_KEY + ':').toString('base64')}`,
        },
        body: JSON.stringify({
          body: note,
        }),
      });

      if (!noteResponse.ok) {
        console.error('Failed to add note to Follow Up Boss');
        return false;
      }

      console.log(`Added note to Follow Up Boss lead: ${email}`);
      return true;
    } catch (error) {
      console.error('Error adding note to Follow Up Boss:', error);
      return false;
    }
  }

  /**
   * Verify API connection
   */
  async verifyConnection(): Promise<boolean> {
    if (!FOLLOW_UP_BOSS_API_KEY) {
      return false;
    }

    try {
      const response = await fetch(`${FOLLOW_UP_BOSS_BASE_URL}/users`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(FOLLOW_UP_BOSS_API_KEY + ':').toString('base64')}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Follow Up Boss connection failed:', error);
      return false;
    }
  }
}

export const followUpBossService = new FollowUpBossService();
