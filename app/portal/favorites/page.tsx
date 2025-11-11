'use client';

import { useState, useEffect } from 'react';
import PropertyRating, { PropertyCategory } from '@/components/portal/PropertyRating';
import { Property } from '@/lib/types';

interface PropertyPreference {
  id: string;
  propertyMlsNumber: string;
  propertyAddress: string;
  propertyData: Property;
  category: PropertyCategory;
  clientNotes?: string;
  lastViewedAt: string;
  viewCount: number;
}

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState<PropertyCategory | 'all'>('all');
  const [properties, setProperties] = useState<PropertyPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ love: 0, like: 0, leave: 0, total: 0 });

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      // TODO: Get clientId from auth
      const clientId = new URLSearchParams(window.location.search).get('clientId');

      const response = await fetch(`/api/portal/favorites?clientId=${clientId}`);
      const data = await response.json();

      if (data.success) {
        setProperties(data.preferences);
        setCounts(data.counts);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRateProperty = async (propertyMlsNumber: string, category: PropertyCategory) => {
    try {
      // TODO: Get clientId from auth
      const clientId = new URLSearchParams(window.location.search).get('clientId');

      const property = properties.find((p) => p.propertyMlsNumber === propertyMlsNumber);
      if (!property) return;

      const response = await fetch('/api/portal/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          property: property.propertyData,
          category,
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchFavorites(); // Refresh list
      }
    } catch (error) {
      console.error('Error rating property:', error);
      throw error;
    }
  };

  const filteredProperties = properties.filter((p) => {
    if (activeTab === 'all') return true;
    return p.category === activeTab;
  });

  const tabs = [
    { key: 'all' as const, label: 'All Properties', count: counts.total },
    { key: 'love' as const, label: '❤️ Love It!', count: counts.love, color: 'red' },
    { key: 'like' as const, label: '👍 Like It!', count: counts.like, color: 'blue' },
    { key: 'leave' as const, label: '👎 Leave It!!!', count: counts.leave, color: 'gray' },
  ];

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
        <h1 className="text-3xl font-bold text-gray-900">My Property Favorites</h1>
        <p className="text-gray-600 mt-2">
          Rate properties and organize them to make your decision easier
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center space-x-1 p-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 rounded-md font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? tab.color === 'red'
                    ? 'bg-red-600 text-white'
                    : tab.color === 'blue'
                    ? 'bg-blue-600 text-white'
                    : tab.color === 'gray'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-sm opacity-75">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
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
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h3 className="mt-4 text-xl font-medium text-gray-900">
            {activeTab === 'all'
              ? 'No properties rated yet'
              : `No properties in "${tabs.find((t) => t.key === activeTab)?.label}" category`}
          </h3>
          <p className="mt-2 text-gray-600">
            {activeTab === 'all'
              ? 'Start rating properties to organize your favorites'
              : 'Rate some properties with this category to see them here'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((pref) => (
            <div key={pref.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Property Image */}
              {pref.propertyData.photos && pref.propertyData.photos.length > 0 ? (
                <img
                  src={pref.propertyData.photos[0].url}
                  alt={pref.propertyAddress}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}

              {/* Property Details */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900">{pref.propertyAddress}</h3>
                <p className="text-sm text-gray-600">
                  {pref.propertyData.city}, {pref.propertyData.province}
                </p>

                <div className="mt-3">
                  <p className="text-2xl font-bold text-blue-600">
                    ${pref.propertyData.price.toLocaleString()}
                  </p>
                </div>

                <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                  {pref.propertyData.bedrooms && (
                    <span>{pref.propertyData.bedrooms} bd</span>
                  )}
                  {pref.propertyData.bathrooms && (
                    <span>{pref.propertyData.bathrooms} ba</span>
                  )}
                  {pref.propertyData.squareFeet && (
                    <span>{pref.propertyData.squareFeet.toLocaleString()} sqft</span>
                  )}
                </div>

                {pref.clientNotes && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs text-yellow-900">{pref.clientNotes}</p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <PropertyRating
                    propertyMlsNumber={pref.propertyMlsNumber}
                    initialCategory={pref.category}
                    onRate={(category) => handleRateProperty(pref.propertyMlsNumber, category)}
                    size="small"
                  />
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Viewed {pref.viewCount} {pref.viewCount === 1 ? 'time' : 'times'} · Last viewed{' '}
                  {new Date(pref.lastViewedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
