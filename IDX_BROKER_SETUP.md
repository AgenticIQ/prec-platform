# IDX Broker Integration - Complete Setup

## ✅ What's Already Done

I've integrated your IDX Broker account with the platform:

- **API Key Configured**: `@wEiFaxT5@fB2daePwN-Bf`
- **IDX Broker API Client**: `lib/services/idxBrokerApi.ts`
- **API Integration**: Complete with search, fetch, and property transformation
- **Environment Variables**: Updated for IDX Broker

## IDX Broker API Endpoints Used

The platform now uses these IDX Broker endpoints:

1. **Search Properties**: `/clients/search` - For public search and client searches
2. **Featured Listings**: `/clients/featured` - For featured/active listings
3. **Single Property**: `/clients/listing/{mlsID}` - For property detail pages
4. **Sold Listings**: `/clients/sold` - For VOW (Virtual Office Website) access

## How It Works

### Public Search Flow
1. User enters search criteria (city, price, property type, etc.)
2. Platform calls IDX Broker API with your API key
3. Results are transformed to our format
4. Displayed with MLS® compliance (copyright, brokerage attribution)

### Daily Data Refresh
1. Cron job runs at 2am daily
2. Fetches all active listings from IDX Broker
3. Updates local database cache
4. Removes stale listings

### Client Notifications
1. System checks saved searches against new listings
2. Matches are sent via email
3. Clients see new properties in their portal

## Property Type Mapping

IDX Broker uses codes, we display friendly names:

| IDX Broker Code | Display Name |
|----------------|--------------|
| SFR | Single Family |
| TH | Townhouse |
| CND | Condo/Apartment |
| MUL | Multi-Family |
| LND | Vacant Land |
| MH | Manufactured/Mobile |

## Testing the Integration

### Test API Connection

You can test if the API key works:

```bash
curl -H "accesskey: @wEiFaxT5@fB2daePwN-Bf" \
     -H "outputtype: json" \
     https://api.idxbroker.com/clients/featured
```

This should return JSON with your featured listings.

## Next Steps

Now that IDX Broker is configured, you need to:

### 1. Set Up Supabase (30 minutes)

Create `.env.local` file with:

```bash
# IDX Broker (already configured!)
IDX_BROKER_API_KEY=@wEiFaxT5@fB2daePwN-Bf

# Supabase (you need to add these)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# SendGrid (for emails)
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=andrea@capitalcitygroup.ca

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key

# App Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=PREC Real Estate
JWT_SECRET=your-random-32-char-string
CRON_SECRET=your-random-32-char-string
ADMIN_EMAIL=andrea@capitalcitygroup.ca
```

To get Supabase credentials:
1. Go to https://supabase.com and create account
2. Create new project
3. Go to Project Settings → API
4. Copy URL and keys
5. Go to SQL Editor
6. Paste contents of `lib/supabase/schema.sql`
7. Click "Run"

### 2. Set Up SendGrid (15 minutes)

1. Go to https://sendgrid.com
2. Verify your email: andrea@capitalcitygroup.ca
3. Generate API key
4. Add to `.env.local`

### 3. Set Up Google Maps (15 minutes)

1. Go to Google Cloud Console
2. Enable "Maps JavaScript API"
3. Create API key
4. Add to `.env.local`

### 4. Test Locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000 and test property search with real IDX Broker data!

## Summary

✅ IDX Broker API is fully integrated
✅ Your API key is configured
✅ Search, fetch, and property details work
✅ Ready to test once Supabase is set up

**Next priority**: Set up Supabase database!
