// Core type definitions for PREC platform

export interface Property {
  id: string;
  mlsNumber: string;
  listingBrokerage: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  price: number;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: number;
  yearBuilt?: number;
  description: string;
  features: string[];
  photos: PropertyPhoto[];
  latitude: number;
  longitude: number;
  status: 'Active' | 'Pending' | 'Sold' | 'Expired' | 'Withdrawn';
  listingDate: Date;
  lastUpdated: Date;
  permitIDX: boolean;
}

export interface PropertyPhoto {
  url: string;
  caption?: string;
  order: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  createdAt: Date;
  lastLoginAt?: Date;
  expiryDate: Date;
  status: 'active' | 'expired' | 'suspended';
  acceptedTOU: boolean;
  acceptedTOUDate?: Date;
  notificationPreferences: NotificationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}

export interface SavedSearch {
  id: string;
  clientId: string;
  name: string;
  criteria: SearchCriteria;
  createdAt: Date;
  lastNotified?: Date;
  active: boolean;
}

export interface SearchCriteria {
  cities?: string[];
  neighborhoods?: string[];
  minPrice?: number;
  maxPrice?: number;
  propertyTypes?: string[];
  minBedrooms?: number;
  minBathrooms?: number;
  minSquareFeet?: number;
  maxSquareFeet?: number;
  features?: string[];
  keywords?: string;
}

export interface SearchResult {
  properties: Property[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface Notification {
  id: string;
  clientId: string;
  searchId: string;
  properties: Property[];
  sentAt: Date;
  status: 'pending' | 'sent' | 'failed';
  type: 'email' | 'sms';
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent';
}

export interface ClientActivity {
  id: string;
  clientId: string;
  action: string;
  details?: string;
  timestamp: Date;
}
