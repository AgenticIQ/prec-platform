// Mock property data for testing
import { Property } from '@/lib/types';

export const mockProperties: Property[] = [
  {
    id: '1',
    mlsNumber: 'TEST001',
    listingBrokerage: 'Capital City Group',
    address: '123 Oak Bay Avenue',
    city: 'Oak Bay',
    province: 'BC',
    postalCode: 'V8R 1E4',
    price: 1250000,
    propertyType: 'Single Family',
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2500,
    lotSize: 5000,
    yearBuilt: 2010,
    description: 'Beautiful family home in Oak Bay with ocean views. Recently renovated kitchen and bathrooms. Large backyard perfect for entertaining.',
    features: ['Ocean View', 'Renovated Kitchen', 'Large Backyard', 'Hardwood Floors'],
    photos: [
      { url: 'https://via.placeholder.com/800x600?text=Property+1', order: 0 }
    ],
    latitude: 48.4284,
    longitude: -123.3656,
    status: 'Active',
    listingDate: new Date('2024-01-15'),
    lastUpdated: new Date(),
    permitIDX: true,
  },
  {
    id: '2',
    mlsNumber: 'TEST002',
    listingBrokerage: 'Capital City Group',
    address: '456 Government Street',
    city: 'Victoria',
    province: 'BC',
    postalCode: 'V8V 2K8',
    price: 650000,
    propertyType: 'Condo/Apartment',
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1200,
    lotSize: 0,
    yearBuilt: 2018,
    description: 'Modern downtown condo with stunning views. Walking distance to restaurants, shops, and waterfront. In-suite laundry and secure parking included.',
    features: ['Downtown Location', 'In-Suite Laundry', 'Secure Parking', 'Mountain Views'],
    photos: [
      { url: 'https://via.placeholder.com/800x600?text=Property+2', order: 0 }
    ],
    latitude: 48.4262,
    longitude: -123.3672,
    status: 'Active',
    listingDate: new Date('2024-02-01'),
    lastUpdated: new Date(),
    permitIDX: true,
  },
  {
    id: '3',
    mlsNumber: 'TEST003',
    listingBrokerage: 'Capital City Group',
    address: '789 Fairfield Road',
    city: 'Victoria',
    province: 'BC',
    postalCode: 'V8V 3A5',
    price: 895000,
    propertyType: 'Townhouse',
    bedrooms: 3,
    bathrooms: 2.5,
    squareFeet: 1800,
    lotSize: 2000,
    yearBuilt: 2015,
    description: 'Spacious townhouse in sought-after Fairfield neighborhood. Three levels of living space with private patio and garage. Close to parks and beaches.',
    features: ['3 Levels', 'Private Patio', 'Garage', 'Near Beach'],
    photos: [
      { url: 'https://via.placeholder.com/800x600?text=Property+3', order: 0 }
    ],
    latitude: 48.4169,
    longitude: -123.3536,
    status: 'Active',
    listingDate: new Date('2024-01-20'),
    lastUpdated: new Date(),
    permitIDX: true,
  },
  {
    id: '4',
    mlsNumber: 'TEST004',
    listingBrokerage: 'Capital City Group',
    address: '1010 Beach Drive',
    city: 'Saanich',
    province: 'BC',
    postalCode: 'V8S 2G1',
    price: 1450000,
    propertyType: 'Single Family',
    bedrooms: 5,
    bathrooms: 4,
    squareFeet: 3200,
    lotSize: 6500,
    yearBuilt: 2005,
    description: 'Stunning waterfront property with panoramic ocean views. Chef\'s kitchen, spa-like bathrooms, and private beach access. Perfect for luxury living.',
    features: ['Waterfront', 'Private Beach Access', 'Chef\'s Kitchen', 'Ocean Views', 'Hot Tub'],
    photos: [
      { url: 'https://via.placeholder.com/800x600?text=Property+4', order: 0 }
    ],
    latitude: 48.4615,
    longitude: -123.3102,
    status: 'Active',
    listingDate: new Date('2024-01-25'),
    lastUpdated: new Date(),
    permitIDX: true,
  },
  {
    id: '5',
    mlsNumber: 'TEST005',
    listingBrokerage: 'Capital City Group',
    address: '321 Esquimalt Road',
    city: 'Esquimalt',
    province: 'BC',
    postalCode: 'V9A 3M1',
    price: 725000,
    propertyType: 'Single Family',
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1650,
    lotSize: 4200,
    yearBuilt: 1995,
    description: 'Charming family home with updated finishes. Spacious living areas, fenced backyard, and close to schools and amenities.',
    features: ['Fenced Yard', 'Updated Kitchen', 'Near Schools', 'Quiet Street'],
    photos: [
      { url: 'https://via.placeholder.com/800x600?text=Property+5', order: 0 }
    ],
    latitude: 48.4295,
    longitude: -123.4168,
    status: 'Active',
    listingDate: new Date('2024-02-05'),
    lastUpdated: new Date(),
    permitIDX: true,
  },
  {
    id: '6',
    mlsNumber: 'TEST006',
    listingBrokerage: 'Capital City Group',
    address: '555 Langford Parkway',
    city: 'Langford',
    province: 'BC',
    postalCode: 'V9B 4V1',
    price: 549000,
    propertyType: 'Townhouse',
    bedrooms: 3,
    bathrooms: 2.5,
    squareFeet: 1500,
    lotSize: 1500,
    yearBuilt: 2020,
    description: 'Modern townhouse in family-friendly neighborhood. Open concept main floor, master with ensuite, and attached garage. Close to shopping and recreation.',
    features: ['New Construction', 'Open Concept', 'Garage', 'Near Shopping'],
    photos: [
      { url: 'https://via.placeholder.com/800x600?text=Property+6', order: 0 }
    ],
    latitude: 48.4475,
    longitude: -123.5048,
    status: 'Active',
    listingDate: new Date('2024-02-10'),
    lastUpdated: new Date(),
    permitIDX: true,
  },
];

export function getMockProperties(criteria?: any): Property[] {
  // Simple filtering based on criteria
  let filtered = [...mockProperties];

  if (criteria?.cities && criteria.cities.length > 0) {
    filtered = filtered.filter(p => criteria.cities.includes(p.city));
  }

  if (criteria?.minPrice) {
    filtered = filtered.filter(p => p.price >= criteria.minPrice);
  }

  if (criteria?.maxPrice) {
    filtered = filtered.filter(p => p.price <= criteria.maxPrice);
  }

  if (criteria?.propertyTypes && criteria.propertyTypes.length > 0) {
    filtered = filtered.filter(p => criteria.propertyTypes.includes(p.propertyType));
  }

  if (criteria?.minBedrooms) {
    filtered = filtered.filter(p => p.bedrooms && p.bedrooms >= criteria.minBedrooms);
  }

  return filtered;
}
