// Search Filters Component
'use client';

import { SearchCriteria } from '@/lib/types';
import { useState } from 'react';

interface SearchFiltersProps {
  onSearch: (criteria: SearchCriteria) => void;
  initialCriteria?: SearchCriteria;
}

const VICTORIA_CITIES = [
  'Victoria',
  'Oak Bay',
  'Saanich',
  'Esquimalt',
  'View Royal',
  'Langford',
  'Colwood',
  'Metchosin',
  'Sooke',
  'Sidney',
  'Central Saanich',
  'North Saanich',
];

const PROPERTY_TYPES = [
  'Single Family',
  'Townhouse',
  'Condo/Apartment',
  'Multi-Family',
  'Vacant Land',
  'Manufactured/Mobile',
];

export default function SearchFilters({ onSearch, initialCriteria }: SearchFiltersProps) {
  const [criteria, setCriteria] = useState<SearchCriteria>(initialCriteria || {});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(criteria);
  };

  const handleReset = () => {
    setCriteria({});
    onSearch({});
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      {/* Basic Filters - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* City */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <select
            id="city"
            multiple
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            value={criteria.cities || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              setCriteria({ ...criteria, cities: selected });
            }}
          >
            {VICTORIA_CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
        </div>

        {/* Price Range */}
        <div>
          <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Min Price
          </label>
          <input
            type="number"
            id="minPrice"
            placeholder="Min Price"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            value={criteria.minPrice || ''}
            onChange={(e) => setCriteria({ ...criteria, minPrice: e.target.value ? parseInt(e.target.value) : undefined })}
          />
        </div>

        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Max Price
          </label>
          <input
            type="number"
            id="maxPrice"
            placeholder="Max Price"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            value={criteria.maxPrice || ''}
            onChange={(e) => setCriteria({ ...criteria, maxPrice: e.target.value ? parseInt(e.target.value) : undefined })}
          />
        </div>

        {/* Property Type */}
        <div>
          <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
            Property Type
          </label>
          <select
            id="propertyType"
            multiple
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            value={criteria.propertyTypes || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              setCriteria({ ...criteria, propertyTypes: selected });
            }}
          >
            {PROPERTY_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters - Collapsible */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 pt-4 border-t border-gray-200">
          {/* Bedrooms */}
          <div>
            <label htmlFor="minBedrooms" className="block text-sm font-medium text-gray-700 mb-1">
              Min Bedrooms
            </label>
            <input
              type="number"
              id="minBedrooms"
              min="0"
              placeholder="Any"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              value={criteria.minBedrooms || ''}
              onChange={(e) => setCriteria({ ...criteria, minBedrooms: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>

          {/* Bathrooms */}
          <div>
            <label htmlFor="minBathrooms" className="block text-sm font-medium text-gray-700 mb-1">
              Min Bathrooms
            </label>
            <input
              type="number"
              id="minBathrooms"
              min="0"
              step="0.5"
              placeholder="Any"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              value={criteria.minBathrooms || ''}
              onChange={(e) => setCriteria({ ...criteria, minBathrooms: e.target.value ? parseFloat(e.target.value) : undefined })}
            />
          </div>

          {/* Square Feet Min */}
          <div>
            <label htmlFor="minSquareFeet" className="block text-sm font-medium text-gray-700 mb-1">
              Min Sq Ft
            </label>
            <input
              type="number"
              id="minSquareFeet"
              placeholder="Any"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              value={criteria.minSquareFeet || ''}
              onChange={(e) => setCriteria({ ...criteria, minSquareFeet: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>

          {/* Square Feet Max */}
          <div>
            <label htmlFor="maxSquareFeet" className="block text-sm font-medium text-gray-700 mb-1">
              Max Sq Ft
            </label>
            <input
              type="number"
              id="maxSquareFeet"
              placeholder="Any"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              value={criteria.maxSquareFeet || ''}
              onChange={(e) => setCriteria({ ...criteria, maxSquareFeet: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>

          {/* Keywords */}
          <div className="md:col-span-2 lg:col-span-4">
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
              Keywords
            </label>
            <input
              type="text"
              id="keywords"
              placeholder="e.g., waterfront, updated kitchen, pool"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              value={criteria.keywords || ''}
              onChange={(e) => setCriteria({ ...criteria, keywords: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Search Properties
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {isExpanded ? '− Less Filters' : '+ More Filters'}
        </button>
      </div>

      {/* Result Count Warning */}
      <p className="mt-4 text-xs text-gray-500">
        Search results limited to 350 properties per MLS® regulations
      </p>
    </form>
  );
}
