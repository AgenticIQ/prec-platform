'use client';

import { useState } from 'react';
import { SearchCriteria } from '@/lib/types';

interface SavedSearchFormProps {
  initialData?: {
    searchName: string;
    searchDescription: string;
    criteria: SearchCriteria;
    notificationFrequency: 'realtime' | 'daily' | 'weekly' | 'monthly';
    notificationTime?: string;
    notificationDays?: string[];
  };
  onSubmit: (formData: any) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

const CITIES = [
  'Victoria', 'Saanich', 'Oak Bay', 'Esquimalt', 'View Royal',
  'Langford', 'Colwood', 'Metchosin', 'Sooke', 'Sidney',
  'North Saanich', 'Central Saanich', 'Salt Spring Island'
];

const PROPERTY_TYPES = [
  'Single Family', 'Townhouse', 'Condo/Apartment',
  'Multi-Family', 'Vacant Land', 'Manufactured/Mobile'
];

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export default function SavedSearchForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Search',
}: SavedSearchFormProps) {
  const [loading, setLoading] = useState(false);

  // Form state
  const [searchName, setSearchName] = useState(initialData?.searchName || '');
  const [searchDescription, setSearchDescription] = useState(initialData?.searchDescription || '');

  // Search criteria
  const [selectedCities, setSelectedCities] = useState<string[]>(initialData?.criteria.cities || []);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(
    initialData?.criteria.propertyTypes || []
  );
  const [minPrice, setMinPrice] = useState<string>(initialData?.criteria.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState<string>(initialData?.criteria.maxPrice?.toString() || '');
  const [minBedrooms, setMinBedrooms] = useState<string>(initialData?.criteria.minBedrooms?.toString() || '');
  const [minBathrooms, setMinBathrooms] = useState<string>(initialData?.criteria.minBathrooms?.toString() || '');
  const [minSquareFeet, setMinSquareFeet] = useState<string>(
    initialData?.criteria.minSquareFeet?.toString() || ''
  );

  // Notification settings
  const [notificationFrequency, setNotificationFrequency] = useState<
    'realtime' | 'daily' | 'weekly' | 'monthly'
  >(initialData?.notificationFrequency || 'daily');
  const [notificationTime, setNotificationTime] = useState<string>(initialData?.notificationTime || '08:00');
  const [notificationDays, setNotificationDays] = useState<string[]>(initialData?.notificationDays || ['monday']);

  const handleCityToggle = (city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  };

  const handlePropertyTypeToggle = (type: string) => {
    setSelectedPropertyTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleDayToggle = (day: string) => {
    setNotificationDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = {
        searchName,
        searchDescription,
        criteria: {
          cities: selectedCities.length > 0 ? selectedCities : undefined,
          propertyTypes: selectedPropertyTypes.length > 0 ? selectedPropertyTypes : undefined,
          minPrice: minPrice ? parseInt(minPrice) : undefined,
          maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
          minBedrooms: minBedrooms ? parseInt(minBedrooms) : undefined,
          minBathrooms: minBathrooms ? parseInt(minBathrooms) : undefined,
          minSquareFeet: minSquareFeet ? parseInt(minSquareFeet) : undefined,
        },
        notificationFrequency,
        notificationTime,
        notificationDays: notificationFrequency === 'weekly' ? notificationDays : undefined,
      };

      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to save search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Search Name & Description */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Details</h3>

        <div className="space-y-4">
          <div>
            <label htmlFor="searchName" className="block text-sm font-medium text-gray-700 mb-1">
              Search Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="searchName"
              required
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="e.g., Downtown Victoria Condos"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {!searchName && (
              <p className="text-xs text-gray-500 mt-1">Give your search a memorable name</p>
            )}
          </div>

          <div>
            <label htmlFor="searchDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <textarea
              id="searchDescription"
              value={searchDescription}
              onChange={(e) => setSearchDescription(e.target.value)}
              placeholder="Add any notes about this search..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Search Criteria */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Criteria</h3>

        <div className="space-y-6">
          {/* Cities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cities</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {CITIES.map((city) => (
                <label key={city} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCities.includes(city)}
                    onChange={() => handleCityToggle(city)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{city}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Property Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PROPERTY_TYPES.map((type) => (
                <label key={type} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPropertyTypes.includes(type)}
                    onChange={() => handlePropertyTypeToggle(type)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Min Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  id="minPrice"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="No minimum"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Max Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  id="maxPrice"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="No maximum"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Bedrooms & Bathrooms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="minBedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Min Bedrooms
              </label>
              <select
                id="minBedrooms"
                value={minBedrooms}
                onChange={(e) => setMinBedrooms(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>

            <div>
              <label htmlFor="minBathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Min Bathrooms
              </label>
              <select
                id="minBathrooms"
                value={minBathrooms}
                onChange={(e) => setMinBathrooms(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>
          </div>

          {/* Square Feet */}
          <div>
            <label htmlFor="minSquareFeet" className="block text-sm font-medium text-gray-700 mb-1">
              Min Square Feet
            </label>
            <input
              type="number"
              id="minSquareFeet"
              value={minSquareFeet}
              onChange={(e) => setMinSquareFeet(e.target.value)}
              placeholder="No minimum"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>

        <div className="space-y-4">
          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How often? <span className="text-red-600">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  value="realtime"
                  checked={notificationFrequency === 'realtime'}
                  onChange={(e) => setNotificationFrequency(e.target.value as any)}
                  className="w-4 h-4 text-blue-600 border-gray-300 mt-0.5"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Real-time (Hourly)</span>
                  <p className="text-xs text-gray-500">Perfect for buyers ready to act fast</p>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  value="daily"
                  checked={notificationFrequency === 'daily'}
                  onChange={(e) => setNotificationFrequency(e.target.value as any)}
                  className="w-4 h-4 text-blue-600 border-gray-300 mt-0.5"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Daily</span>
                  <p className="text-xs text-gray-500">Daily digest of new listings</p>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  value="weekly"
                  checked={notificationFrequency === 'weekly'}
                  onChange={(e) => setNotificationFrequency(e.target.value as any)}
                  className="w-4 h-4 text-blue-600 border-gray-300 mt-0.5"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Weekly</span>
                  <p className="text-xs text-gray-500">Weekly summary on your chosen day(s)</p>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  value="monthly"
                  checked={notificationFrequency === 'monthly'}
                  onChange={(e) => setNotificationFrequency(e.target.value as any)}
                  className="w-4 h-4 text-blue-600 border-gray-300 mt-0.5"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Monthly</span>
                  <p className="text-xs text-gray-500">Monthly update for long-term planning</p>
                </div>
              </label>
            </div>
          </div>

          {/* Time of Day (for daily/weekly/monthly) */}
          {notificationFrequency !== 'realtime' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What time of day? <span className="text-red-600">*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="08:00"
                    checked={notificationTime === '08:00'}
                    onChange={(e) => setNotificationTime(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300"
                  />
                  <span className="text-sm text-gray-900">Morning (8:00 AM)</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="12:00"
                    checked={notificationTime === '12:00'}
                    onChange={(e) => setNotificationTime(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300"
                  />
                  <span className="text-sm text-gray-900">Afternoon (12:00 PM)</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="18:00"
                    checked={notificationTime === '18:00'}
                    onChange={(e) => setNotificationTime(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300"
                  />
                  <span className="text-sm text-gray-900">Evening (6:00 PM)</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="custom"
                    checked={!['08:00', '12:00', '18:00'].includes(notificationTime)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNotificationTime('09:00');
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">Custom time:</span>
                    {!['08:00', '12:00', '18:00'].includes(notificationTime) && (
                      <input
                        type="time"
                        value={notificationTime}
                        onChange={(e) => setNotificationTime(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Days of Week (for weekly) */}
          {notificationFrequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Which day(s)? <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <label key={day.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationDays.includes(day.value)}
                      onChange={() => handleDayToggle(day.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{day.label}</span>
                  </label>
                ))}
              </div>
              {notificationDays.length === 0 && (
                <p className="text-xs text-red-600 mt-2 font-medium">⚠️ Please select at least one day of the week</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="space-y-3">
        {/* Validation Message */}
        {(!searchName || (notificationFrequency === 'weekly' && notificationDays.length === 0)) && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800 font-medium">⚠️ Please complete all required fields:</p>
            <ul className="text-sm text-red-700 mt-1 ml-5 list-disc">
              {!searchName && <li>Search name is required</li>}
              {notificationFrequency === 'weekly' && notificationDays.length === 0 && (
                <li>Select at least one day of the week</li>
              )}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !searchName || (notificationFrequency === 'weekly' && notificationDays.length === 0)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
