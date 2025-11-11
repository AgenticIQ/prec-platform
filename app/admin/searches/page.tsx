'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SavedSearch {
  id: string;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  searchName: string;
  searchDescription?: string;
  criteria: any;
  notificationFrequency: string;
  notificationTime?: string;
  notificationDays?: string[];
  adminShadowNotification: boolean;
  isActive: boolean;
  lastRunAt?: string;
  lastMatchCount: number;
  createdAt: string;
}

interface SearchStats {
  totalSearches: number;
  activeSearches: number;
  shadowNotificationsEnabled: number;
  totalClients: number;
}

export default function AdminSearchesPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [stats, setStats] = useState<SearchStats>({
    totalSearches: 0,
    activeSearches: 0,
    shadowNotificationsEnabled: 0,
    totalClients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'shadow'>('all');

  useEffect(() => {
    fetchSearches();
  }, []);

  const fetchSearches = async () => {
    try {
      const response = await fetch('/api/admin/searches');
      const data = await response.json();

      if (data.success) {
        setSearches(data.searches);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching searches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShadowNotification = async (searchId: string) => {
    try {
      const response = await fetch(`/api/admin/searches/${searchId}/shadow`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        fetchSearches(); // Refresh
      }
    } catch (error) {
      console.error('Error toggling shadow notification:', error);
    }
  };

  const handleToggleActive = async (searchId: string) => {
    try {
      const response = await fetch(`/api/admin/searches/${searchId}/toggle`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        fetchSearches();
      }
    } catch (error) {
      console.error('Error toggling search status:', error);
    }
  };

  const filteredSearches = searches.filter((search) => {
    if (filter === 'active') return search.isActive;
    if (filter === 'shadow') return search.adminShadowNotification;
    return true;
  });

  const getFrequencyLabel = (frequency: string, time?: string, days?: string[]) => {
    if (frequency === 'realtime') return 'Hourly';
    if (frequency === 'daily') {
      const timeLabel = time === '08:00' ? '8AM' : time === '12:00' ? '12PM' : '6PM';
      return `Daily ${timeLabel}`;
    }
    if (frequency === 'weekly') {
      const dayLabels = (days || []).map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ');
      return `${dayLabels}`;
    }
    return 'Monthly';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Client Saved Searches</h1>
        <p className="text-gray-600 mt-2">
          Manage all client searches and configure shadow notifications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">Total Searches</div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalSearches}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">Active Searches</div>
          <div className="text-3xl font-bold text-green-600">{stats.activeSearches}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">Shadow Alerts</div>
          <div className="text-3xl font-bold text-blue-600">{stats.shadowNotificationsEnabled}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">Active Clients</div>
          <div className="text-3xl font-bold text-purple-600">{stats.totalClients}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Searches ({searches.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active Only ({searches.filter(s => s.isActive).length})
          </button>
          <button
            onClick={() => setFilter('shadow')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === 'shadow'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Shadow Enabled ({searches.filter(s => s.adminShadowNotification).length})
          </button>
        </div>
      </div>

      {/* Searches List */}
      {filteredSearches.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <h3 className="text-xl font-medium text-gray-900">No searches found</h3>
          <p className="mt-2 text-gray-600">
            {filter === 'all'
              ? 'No client searches yet'
              : filter === 'active'
              ? 'No active searches'
              : 'No searches with shadow notifications enabled'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSearches.map((search) => (
            <div
              key={search.id}
              className={`bg-white rounded-lg border p-6 ${
                search.adminShadowNotification
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200'
              } ${!search.isActive && 'opacity-60'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Client Info */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                      {search.clientName || search.clientEmail || 'Unknown Client'}
                    </div>
                    {search.isActive ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                        Paused
                      </span>
                    )}
                    {search.adminShadowNotification && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                        🔔 Shadow Alert ON
                      </span>
                    )}
                  </div>

                  {/* Search Name */}
                  <h3 className="text-lg font-bold text-gray-900">{search.searchName}</h3>
                  {search.searchDescription && (
                    <p className="text-sm text-gray-600 mt-1">{search.searchDescription}</p>
                  )}

                  {/* Criteria Summary */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Cities:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {search.criteria.cities?.length || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Price:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {search.criteria.minPrice
                          ? `$${(search.criteria.minPrice / 1000).toFixed(0)}k`
                          : 'Any'}
                        {' - '}
                        {search.criteria.maxPrice
                          ? `$${(search.criteria.maxPrice / 1000).toFixed(0)}k`
                          : 'Any'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Beds:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {search.criteria.minBedrooms ? `${search.criteria.minBedrooms}+` : 'Any'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Frequency:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {getFrequencyLabel(
                          search.notificationFrequency,
                          search.notificationTime,
                          search.notificationDays
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Run:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {search.lastRunAt
                          ? new Date(search.lastRunAt).toLocaleDateString()
                          : 'Never'}
                      </span>
                    </div>
                  </div>

                  {search.lastRunAt && (
                    <div className="mt-3 text-sm text-gray-500">
                      Last matched {search.lastMatchCount} {search.lastMatchCount === 1 ? 'property' : 'properties'}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <button
                    onClick={() => handleToggleShadowNotification(search.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      search.adminShadowNotification
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title="Receive copies of client notifications"
                  >
                    {search.adminShadowNotification ? '🔔 Shadow ON' : '🔕 Shadow OFF'}
                  </button>

                  <button
                    onClick={() => handleToggleActive(search.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      search.isActive
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {search.isActive ? 'Pause' : 'Resume'}
                  </button>

                  <Link
                    href={`/admin/searches/${search.id}`}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
