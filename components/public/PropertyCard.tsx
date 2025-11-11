// Property Card Component for listing display
import { Property } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

interface PropertyCardProps {
  property: Property;
  viewMode?: 'thumbnail' | 'detail';
}

export default function PropertyCard({ property, viewMode = 'thumbnail' }: PropertyCardProps) {
  const photoUrl = property.photos[0]?.url || '/images/placeholder-property.jpg';

  return (
    <Link href={`/property/${property.mlsNumber}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
        {/* Property Image */}
        <div className="relative h-64 w-full">
          <Image
            src={photoUrl}
            alt={property.address}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-md font-semibold">
            ${property.price.toLocaleString()}
          </div>
        </div>

        {/* Property Details */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {property.address}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {property.city}, {property.province} {property.postalCode}
          </p>

          {/* Property Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-700 mb-3">
            {property.bedrooms && (
              <span className="flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {property.bedrooms} beds
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
                {property.bathrooms} baths
              </span>
            )}
            {property.squareFeet && (
              <span className="flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                {property.squareFeet.toLocaleString()} sqft
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-3">
            {property.propertyType}
          </p>

          {/* Listing Brokerage - Compliance Requirement */}
          <p className="text-xs text-gray-500 border-t pt-2">
            Listed by: {property.listingBrokerage}
          </p>
        </div>
      </div>
    </Link>
  );
}
