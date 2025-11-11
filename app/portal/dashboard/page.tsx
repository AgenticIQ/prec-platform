// Client Portal Dashboard
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PropertyCard from '@/components/public/PropertyCard';
import CopyrightNotice from '@/components/public/CopyrightNotice';
import { Property, SavedSearch } from '@/lib/types';

export default function DashboardPage() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [recentListings, setRecentListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/portal/dashboard');
      const data = await response.json();

      if (data.success) {
        setSavedSearches(data.savedSearches || []);
        setRecentListings(data.recentListings || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/portal/dashboard" className="text-blue-600 font-medium">
                Dashboard
              </Link>
              <Link href="/portal/searches" className="text-gray-600 hover:text-gray-900">
                Saved Searches
              </Link>
              <Link href="/portal/profile" className="text-gray-600 hover:text-gray-900">
                Profile
              </Link>
              <button
                onClick={() => {
                  // TODO: Implement logout
                  window.location.href = '/';
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
          <p className="text-blue-100">
            Stay updated with the latest properties matching your criteria
          </p>
        </div>

        {/* Saved Searches */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Your Saved Searches</h3>
            <Link
              href="/portal/searches"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </Link>
          </div>

          {savedSearches.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h4 className="mt-4 text-lg font-medium text-gray-900">No Saved Searches Yet</h4>
              <p className="mt-2 text-gray-600">
                Contact your realtor to set up personalized property searches
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedSearches.map((search) => (
                <div key={search.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{search.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      search.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {search.active ? 'Active' : 'Paused'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    {search.criteria.cities && search.criteria.cities.length > 0 && (
                      <p>Cities: {search.criteria.cities.join(', ')}</p>
                    )}
                    {(search.criteria.minPrice || search.criteria.maxPrice) && (
                      <p>
                        Price: ${search.criteria.minPrice?.toLocaleString() || '0'} - ${search.criteria.maxPrice?.toLocaleString() || '∞'}
                      </p>
                    )}
                    {search.criteria.propertyTypes && search.criteria.propertyTypes.length > 0 && (
                      <p>Types: {search.criteria.propertyTypes.join(', ')}</p>
                    )}
                  </div>

                  <Link
                    href={`/portal/searches/${search.id}`}
                    className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Matching Properties →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Listings */}
        {recentListings.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Recently Added Properties</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentListings.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Copyright Notice */}
      <CopyrightNotice />
    </div>
  );
}
