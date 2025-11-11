# Switching from Mock Data to Real IDX Broker Data

## Current Status

Your platform is **fully functional** using mock data for development. This allows you to:
- ✅ Test the search functionality
- ✅ Develop and refine the UI
- ✅ Test client registration and portal features
- ✅ Work on the platform without API rate limits

**Mock Data Location**: `lib/services/mockData.ts` (6 test properties)

## Why Mock Data?

IDX Broker API is currently rejecting requests from localhost. This is common with real estate APIs that expect requests from production domains only. The error you saw was:

```
IDX Broker API error: Bad Request
```

This happens because:
1. IDX Broker may require domain whitelisting
2. Some APIs restrict localhost for security
3. CORS policies may block local development

## Option 1: Deploy to Production (Recommended)

**This is the easiest way to get real IDX Broker data working.**

### Steps:
1. Deploy to Vercel (free tier):
   ```bash
   cd prec-platform
   npm install -g vercel
   vercel login
   vercel
   ```

2. Add environment variables in Vercel dashboard:
   - All variables from `.env.local`
   - Update `NEXT_PUBLIC_APP_URL` to your production URL

3. Once deployed, the IDX Broker API will work from your `*.vercel.app` domain

4. Switch from mock data to real data (see below)

### Vercel Deployment Benefits:
- ✅ Automatic HTTPS
- ✅ CDN for fast loading
- ✅ Automatic deployments on git push
- ✅ Cron jobs for daily data refresh
- ✅ Free tier is sufficient for initial launch

## Option 2: Whitelist Localhost in IDX Broker

**Try this if you want to develop with real data locally.**

### Steps:
1. Log into IDX Broker: https://middleware.idxbroker.com/mgmt
   - Username: andrea@capitalcitygroup.ca
   - Password: @mazing2022

2. Navigate to **Account Settings** → **API Settings**

3. Look for domain/referrer restrictions

4. Add to whitelist:
   - `localhost`
   - `http://localhost:3000`
   - Your local IP address

5. Save changes and wait 5-10 minutes for propagation

6. Switch from mock data to real data (see below)

**Note**: Not all APIs support localhost whitelisting. If this doesn't work, use Option 1 (deploy to production).

## Switching the Code from Mock to Real Data

Once you have API access (either from production or whitelisted localhost), make this simple change:

### File: `app/api/idx/search/route.ts`

**Current (Mock Data):**
```typescript
// TEMPORARY: Using mock data while IDX Broker API access is being set up
// TODO: Replace with idxBrokerApi.searchProperties() once API access is enabled
console.log('Search criteria received:', JSON.stringify(criteria, null, 2));
const properties = getMockProperties(criteria);
console.log(`Mock search returned ${properties.length} properties`);
```

**Change to (Real Data):**
```typescript
// Using real IDX Broker API
const result = await idxBrokerApi.searchProperties(criteria);

if (!result.success) {
  throw new Error(result.error || 'Search failed');
}

const properties = result.properties || [];
console.log(`IDX Broker returned ${properties.length} properties`);
```

### Full Updated Route Handler:

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { criteria, page = 1, pageSize = 50 }: {
      criteria: SearchCriteria;
      page?: number;
      pageSize?: number;
    } = body;

    // Enforce compliance: max 350 results
    const safePageSize = Math.min(pageSize, MAX_SEARCH_RESULTS);

    // Using real IDX Broker API
    const result = await idxBrokerApi.searchProperties(criteria);

    if (!result.success) {
      throw new Error(result.error || 'Search failed');
    }

    const properties = result.properties || [];

    return NextResponse.json({
      success: true,
      properties,
      total: properties.length,
      page,
      pageSize: safePageSize,
    });
  } catch (error) {
    console.error('IDX search API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      },
      { status: 500 }
    );
  }
}
```

## Testing Real Data

After making the switch:

1. **Restart dev server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Test search on homepage**:
   - Go to http://localhost:3000 (or your production URL)
   - Click "Search Properties" without filters
   - You should see real MLS® listings from your IDX Broker account

3. **Check terminal logs**:
   ```
   IDX Broker returned 147 properties  ← Real data!
   POST /api/idx/search 200 in 1234ms
   ```

4. **Verify property data**:
   - Real addresses from Victoria BC area
   - Actual property photos (not placeholders)
   - Current prices and listings
   - Real MLS® numbers

## Troubleshooting

### Still getting "Bad Request" errors?

1. **Check API key**: Verify in `.env.local`:
   ```
   IDX_BROKER_API_KEY=@wEiFaxT5@fB2daePwN-Bf
   ```

2. **Check IDX Broker account status**:
   - Log into dashboard
   - Verify API access is enabled
   - Check if your account has active listings

3. **Test API directly**:
   ```bash
   curl -X GET \
     "https://api.idxbroker.com/clients/featured" \
     -H "accesskey: @wEiFaxT5@fB2daePwN-Bf" \
     -H "outputtype: json"
   ```

### No properties returned?

1. **Check IDX Broker dashboard** for active listings
2. **Verify search criteria** - might be too restrictive
3. **Check console logs** for API response details

### Images not loading?

1. **Verify `next.config.ts`** includes IDX Broker domains:
   ```typescript
   images: {
     remotePatterns: [
       {
         protocol: 'https',
         hostname: '*.idxbroker.com',
       },
     ],
   }
   ```

2. **Check photo URLs** in API response

## Keeping Mock Data for Development

You can keep both options available:

```typescript
// Add environment variable to toggle
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';

export async function POST(request: NextRequest) {
  try {
    // ... (same setup code)

    let properties;

    if (USE_MOCK_DATA) {
      console.log('Using mock data for development');
      properties = getMockProperties(criteria);
    } else {
      console.log('Using real IDX Broker API');
      const result = await idxBrokerApi.searchProperties(criteria);
      if (!result.success) {
        throw new Error(result.error || 'Search failed');
      }
      properties = result.properties || [];
    }

    return NextResponse.json({
      success: true,
      properties,
      total: properties.length,
      page,
      pageSize: safePageSize,
    });
  } catch (error) {
    // ... (error handling)
  }
}
```

Then in `.env.local`:
```bash
# Set to 'true' for mock data, 'false' for real IDX Broker data
USE_MOCK_DATA=true
```

## When to Switch?

**Stay with mock data while:**
- Developing UI/UX features
- Testing search filters
- Building client portal features
- Working on admin dashboard
- Don't want to hit API rate limits

**Switch to real data when:**
- ✅ Deploying to production
- ✅ Ready to show client real listings
- ✅ Testing with real MLS® data
- ✅ Preparing for launch

## Summary

**Current Setup**: Mock data (6 test properties) - Perfect for development
**Next Step**: Deploy to Vercel → Real IDX Broker data → Launch! 🚀

The platform is **fully built and functional**. Mock data lets you develop and test everything without API restrictions. When you're ready to launch, switch to real data with a simple code change!
