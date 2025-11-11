# Supabase Connection Issue

## Problem

Supabase database connections are failing with error:
```
TypeError: fetch failed
Could not resolve host: btcmcjgvalsmmagpxkpr.supabase.co
```

## Root Cause

DNS cannot resolve the Supabase project URL. This means:
- The Supabase project may not exist
- The URL in `.env.local` is incorrect
- The project was paused or deleted

## Current Configuration

**File: `.env.local`**
```
NEXT_PUBLIC_SUPABASE_URL=https://btcmcjgvalsmmagpxkpr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## How to Fix

### Option 1: Verify Supabase Project URL

1. **Log into Supabase**: https://supabase.com/dashboard

2. **Check your project**:
   - Is the project active?
   - What is the exact Project URL?

3. **Get correct URL**:
   - Go to Project Settings → API
   - Copy the exact "Project URL"
   - It should look like: `https://[PROJECT-ID].supabase.co`

4. **Update `.env.local`**:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=[paste correct URL here]
   ```

5. **Restart dev server**:
   ```bash
   # Ctrl+C to stop
   npm run dev
   ```

### Option 2: Create New Supabase Project

If your project doesn't exist or was deleted:

1. **Go to**: https://supabase.com/dashboard

2. **Click**: "New Project"

3. **Configure**:
   - **Name**: PREC Real Estate
   - **Database Password**: (choose a strong password)
   - **Region**: US West (or closest to Victoria BC)

4. **Wait 2-3 minutes** for project to provision

5. **Get credentials**:
   - Project Settings → API
   - Copy Project URL
   - Copy `anon` public key
   - Copy `service_role` secret key

6. **Update `.env.local`** with new credentials

7. **Run database schema**:
   - Go to SQL Editor in Supabase dashboard
   - Open file: `PASTE_THIS_INTO_SUPABASE.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "Run"

8. **Restart dev server**

## Testing Connection

After fixing the URL, test the connection:

```bash
# Test with curl
curl -I https://[YOUR-PROJECT-ID].supabase.co/rest/v1/

# Should return:
# HTTP/2 200
# content-type: application/json
# ...
```

Or visit in browser:
```
http://localhost:3000/api/test/supabase
```

Should see:
```json
{
  "success": true,
  "message": "Supabase connection successful!",
  "tables": {
    "clients": "OK",
    "saved_searches": "OK",
    "listings": "OK"
  }
}
```

## Current Impact

**What's NOT working**:
- ❌ Client registration
- ❌ Client login
- ❌ Saved searches
- ❌ Any database operations

**What IS working**:
- ✅ Property search (using mock data)
- ✅ Homepage and UI
- ✅ Search filters
- ✅ All frontend features

## Quick Fix Summary

1. Log into Supabase dashboard
2. Verify project exists and get correct URL
3. Update `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
4. Restart `npm run dev`
5. Test: http://localhost:3000/api/test/supabase

---

**Once Supabase is connected, all database features will work immediately!**
