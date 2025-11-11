// Home Page - Public IDX Search
'use client';

import { useState } from 'react';
import Link from 'next/link';
import PropertyCard from '@/components/public/PropertyCard';
import SearchFilters from '@/components/public/SearchFilters';
import CopyrightNotice from '@/components/public/CopyrightNotice';
import { Property, SearchCriteria } from '@/lib/types';

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [currentCriteria, setCurrentCriteria] = useState<SearchCriteria | null>(null);

  const handleSearch = async (criteria: SearchCriteria) => {
    setLoading(true);
    setSearched(true);
    setCurrentCriteria(criteria); // Save current search criteria

    try {
      const response = await fetch('/api/idx/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criteria, page: 1, pageSize: 50 }),
      });

      const data = await response.json();

      if (data.success) {
        setProperties(data.properties);
      } else {
        console.error('Search failed:', data.error);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSearch = () => {
    if (currentCriteria) {
      // Store search criteria in localStorage
      localStorage.setItem('pendingSearchCriteria', JSON.stringify(currentCriteria));
      // Redirect to saved searches page (will prompt login if needed)
      window.location.href = '/portal/saved-searches';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Find Your Dream Home in Victoria BC
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Search exclusive MLS® listings on Vancouver Island
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <SearchFilters onSearch={handleSearch} />
      </section>

      {/* Results Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Searching properties...</p>
          </div>
        )}

        {!loading && searched && properties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              No properties found matching your criteria. Try adjusting your filters.
            </p>
          </div>
        )}

        {!loading && properties.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {properties.length} {properties.length === 1 ? 'Property' : 'Properties'} Found
              </h3>

              {/* Call-to-Action for Saved Searches */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <p className="text-sm text-blue-900">
                  Want automatic updates?{' '}
                  <button
                    onClick={handleSaveSearch}
                    className="font-semibold text-blue-600 hover:text-blue-800 underline cursor-pointer bg-transparent border-none p-0"
                  >
                    Save this search
                  </button>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {properties.length >= 350 && (
              <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  <strong>Note:</strong> Results limited to 350 properties. Please refine your search criteria for more specific results.
                </p>
              </div>
            )}
          </>
        )}

        {/* Initial State - No Search Yet */}
        {!loading && !searched && (
          <div className="text-center py-12">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-gray-900">
              Start Your Property Search
            </h3>
            <p className="mt-2 text-gray-600">
              Use the filters above to search for properties in Victoria BC and Vancouver Island
            </p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Never Miss a New Listing
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            Get instant email notifications when new properties match your criteria
          </p>
          <Link
            href="/portal/register"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Create Your Client Portal
          </Link>
        </div>
      </section>

      {/* Copyright Notice - Required by MLS® */}
      <CopyrightNotice />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} PREC Real Estate. All rights reserved.</p>
            <p className="mt-2 text-xs">
              This information is for consumer use only and may not be used for any purpose other than to identify prospective properties consumers may be interested in purchasing.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
