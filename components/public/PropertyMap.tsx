// Property Map Component using Google Maps
'use client';

import { useEffect, useRef, useState } from 'react';
import { Property } from '@/lib/types';

interface PropertyMapProps {
  properties: Property[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerClick?: (property: Property) => void;
}

// Default center: Victoria, BC
const DEFAULT_CENTER = { lat: 48.4284, lng: -123.3656 };
const DEFAULT_ZOOM = 12;

export default function PropertyMap({
  properties,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  onMarkerClick,
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);

  // Load Google Maps script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error('Google Maps API key not found');
      return;
    }

    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize map
  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const newMap = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });

    const newInfoWindow = new google.maps.InfoWindow();

    setMap(newMap);
    setInfoWindow(newInfoWindow);
  };

  // Update markers when properties change
  useEffect(() => {
    if (!map || !infoWindow) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Create new markers
    const newMarkers = properties
      .filter(property => property.latitude && property.longitude)
      .map(property => {
        const marker = new google.maps.Marker({
          position: {
            lat: property.latitude,
            lng: property.longitude,
          },
          map,
          title: property.address,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="40" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C9.373 0 4 5.373 4 12c0 9 12 28 12 28s12-19 12-28c0-6.627-5.373-12-12-12z" fill="#2563eb"/>
                <circle cx="16" cy="12" r="6" fill="white"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 40),
            anchor: new google.maps.Point(16, 40),
          },
        });

        // Add click listener
        marker.addListener('click', () => {
          setSelectedProperty(property);

          const content = `
            <div style="max-width: 250px; font-family: system-ui;">
              <img src="${property.photos[0]?.url || '/images/placeholder-property.jpg'}"
                   alt="${property.address}"
                   style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${property.address}</h3>
              <p style="margin: 0 0 8px 0; font-size: 20px; font-weight: bold; color: #2563eb;">
                $${property.price.toLocaleString()}
              </p>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
                ${property.bedrooms || 'N/A'} beds • ${property.bathrooms || 'N/A'} baths • ${property.squareFeet ? property.squareFeet.toLocaleString() + ' sqft' : 'N/A'}
              </p>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
                ${property.propertyType} in ${property.city}
              </p>
              <p style="margin: 0; font-size: 10px; color: #999;">
                Listed by: ${property.listingBrokerage}
              </p>
              <a href="/property/${property.mlsNumber}"
                 style="display: inline-block; margin-top: 12px; padding: 8px 16px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">
                View Details
              </a>
            </div>
          `;

          infoWindow.setContent(content);
          infoWindow.open(map, marker);

          if (onMarkerClick) {
            onMarkerClick(property);
          }
        });

        return marker;
      });

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        const position = marker.getPosition();
        if (position) {
          bounds.extend(position);
        }
      });
      map.fitBounds(bounds);
    }
  }, [properties, map, infoWindow, onMarkerClick]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />

      {/* Property Count Badge */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md px-4 py-2">
        <p className="text-sm font-semibold text-gray-900">
          {properties.length} {properties.length === 1 ? 'Property' : 'Properties'}
        </p>
      </div>
    </div>
  );
}
