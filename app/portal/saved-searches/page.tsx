'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SavedSearchForm from '@/components/portal/SavedSearchForm';

interface SavedSearch {
  id: string;
  searchName: string;
  searchDescription?: string;
  criteria: any;
  notificationFrequency: string;
  notificationTime?: string;
  notificationDays?: string[];
  isActive: boolean;
  lastRunAt?: string;
  lastMatchCount: number;
  createdAt: string;
}

export default function SavedSearchesPage() {
  const router = useRouter();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);
  const [pendingCriteria, setPendingCriteria] = useState<any>(null);

  useEffect(() => {
    fetchSavedSearches();

    // Check for pending search criteria from homepage
    const pendingData = localStorage.getItem('pendingSearchCriteria');
    if (pendingData) {
      try {
        const criteria = JSON.parse(pendingData);
        setPendingCriteria(criteria);
        setShowCreateForm(true); // Auto-show the form
        localStorage.removeItem('pendingSearchCriteria'); // Clear it
      } catch (error) {
        console.error('Error parsing pending criteria:', error);
      }
    }
  }, []);

  const fetchSavedSearches = async () => {
    try {
      const response = await fetch('/api/portal/saved-searches');
      const data = await response.json();

      if (data.success) {
        setSearches(data.searches);
      }
    } catch (error) {
      console.error('Error fetching saved searches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSearch = async (formData: any) => {
    try {
      // TODO: Get clientId from auth - for now using query param
      const clientId = new URLSearchParams(window.location.search).get('clientId');

      if (!clientId) {
        alert('Error: No client ID found. Please log in again.');
        return;
      }

      const response = await fetch('/api/portal/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          clientId, // Add the missing clientId
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowCreateForm(false);
        setPendingCriteria(null);
        fetchSavedSearches();
        alert('Search saved successfully!');
      } else {
        alert('Failed to save search: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating search:', error);
      alert('Failed to save search. Please try again.');
    }
  };

  const handleUpdateSearch = async (formData: any) => {
    if (!editingSearch) return;

    try {
      const response = await fetch(`/api/portal/saved-searches/${editingSearch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setEditingSearch(null);
        fetchSavedSearches();
        alert('Search updated successfully!');
      } else {
        alert('Failed to update search: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating search:', error);
      alert('Failed to update search. Please try again.');
    }
  };

  const handleToggleActive = async (searchId: string) => {
    try {
      const response = await fetch(`/api/portal/saved-searches/${searchId}/toggle`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        fetchSavedSearches();
      }
    } catch (error) {
      console.error('Error toggling search:', error);
    }
  };

  const handleDeleteSearch = async (searchId: string) => {
    if (!confirm('Are you sure you want to delete this search?')) return;

    try {
      const response = await fetch(`/api/portal/saved-searches/${searchId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchSavedSearches();
        alert('Search deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting search:', error);
      alert('Failed to delete search. Please try again.');
    }
  };

  const getFrequencyLabel = (frequency: string, time?: string, days?: string[]) => {
    if (frequency === 'realtime') return 'Real-time (Hourly)';
    if (frequency === 'daily') {
      const timeLabel = time === '08:00' ? 'Morning' : time === '12:00' ? 'Noon' : 'Evening';
      return `Daily at ${timeLabel}`;
    }
    if (frequency === 'weekly') {
      const dayLabels = (days || []).map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ');
      const timeLabel = time === '08:00' ? 'Morning' : time === '12:00' ? 'Noon' : 'Evening';
      return `Weekly on ${dayLabels} (${timeLabel})`;
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
        {/* Testing Helper - Remove when auth is implemented */}
        {!new URLSearchParams(window.location.search).get('clientId') && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900 font-medium">
              ⚠️ Testing Mode: Add ?clientId=YOUR_CLIENT_ID to the URL to test saved searches
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Example: /portal/saved-searches?clientId=test-user-123
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Saved Searches</h1>
            <p className="text-gray-600 mt-2">
              Create automated property alerts and manage your search preferences
            </p>
          </div>

          {!showCreateForm && !editingSearch && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold"
            >
              + Create New Search
            </button>
          )}
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {pendingCriteria ? 'Save Your Search' : 'Create New Saved Search'}
            </h2>
            {pendingCriteria && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-900">
                  ✓ Your search criteria has been loaded! Give it a name and choose how often you'd like to be notified.
                </p>
              </div>
            )}
            <SavedSearchForm
              initialData={pendingCriteria ? {
                searchName: '',
                searchDescription: '',
                criteria: pendingCriteria,
                notificationFrequency: 'daily',
                notificationTime: '08:00',
                notificationDays: [],
              } : undefined}
              onSubmit={handleCreateSearch}
              onCancel={() => {
                setShowCreateForm(false);
                setPendingCriteria(null);
              }}
              submitLabel="Create Search"
            />
          </div>
        </div>
      )}

      {/* Edit Form */}
      {editingSearch && (
        <div className="mb-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Saved Search</h2>
            <SavedSearchForm
              initialData={{
                searchName: editingSearch.searchName,
                searchDescription: editingSearch.searchDescription || '',
                criteria: editingSearch.criteria,
                notificationFrequency: editingSearch.notificationFrequency as any,
                notificationTime: editingSearch.notificationTime,
                notificationDays: editingSearch.notificationDays,
              }}
              onSubmit={handleUpdateSearch}
              onCancel={() => setEditingSearch(null)}
              submitLabel="Update Search"
            />
          </div>
        </div>
      )}

      {/* Saved Searches List */}
      {!showCreateForm && !editingSearch && (
        <>
          {searches.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <svg
                className="mx-auto h-24 w-24 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="mt-4 text-xl font-medium text-gray-900">No saved searches yet</h3>
              <p className="mt-2 text-gray-600">
                Create your first saved search to receive automatic notifications when new properties match your
                criteria
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold"
              >
                Create Your First Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {searches.map((search) => (
                <div
                  key={search.id}
                  className={`bg-white rounded-lg border ${
                    search.isActive ? 'border-blue-200' : 'border-gray-200'
                  } p-6 ${!search.isActive && 'opacity-60'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-bold text-gray-900">{search.searchName}</h3>
                        {search.isActive ? (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                            Paused
                          </span>
                        )}
                      </div>

                      {search.searchDescription && (
                        <p className="text-gray-600 mt-2">{search.searchDescription}</p>
                      )}

                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Cities:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {search.criteria.cities?.join(', ') || 'Any'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Price:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {search.criteria.minPrice
                              ? `$${search.criteria.minPrice.toLocaleString()}`
                              : 'Any'}{' '}
                            -{' '}
                            {search.criteria.maxPrice
                              ? `$${search.criteria.maxPrice.toLocaleString()}`
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
                          <span className="text-gray-500">Notifications:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {getFrequencyLabel(
                              search.notificationFrequency,
                              search.notificationTime,
                              search.notificationDays
                            )}
                          </span>
                        </div>
                      </div>

                      {search.lastRunAt && (
                        <div className="mt-4 text-sm text-gray-500">
                          Last checked: {new Date(search.lastRunAt).toLocaleString()} · {search.lastMatchCount}{' '}
                          {search.lastMatchCount === 1 ? 'match' : 'matches'}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleToggleActive(search.id)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          search.isActive
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {search.isActive ? 'Pause' : 'Resume'}
                      </button>
                      <button
                        onClick={() => setEditingSearch(search)}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSearch(search.id)}
                        className="px-4 py-2 bg-red-100 text-red-800 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
