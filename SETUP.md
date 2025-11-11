# PREC Real Estate Platform - Setup Guide

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier is fine to start)
- Bridge Interactive API credentials (VIVA MLS® System)
- SendGrid account for email notifications
- Google Maps API key
- Git installed

## Step 1: Environment Setup

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in all environment variables in `.env.local`:

### Supabase Configuration
- Create a new project at https://supabase.com
- Get your Project URL and Anon Key from Project Settings > API
- Get your Service Role Key (keep this secret!)

### Bridge Interactive API
- Contact Bridge Interactive for API credentials
- Add your API URL, Key, and Secret

### SendGrid Email
- Create account at https://sendgrid.com
- Generate API key from Settings > API Keys
- Verify your sender email address

### Google Maps API
- Enable Google Maps JavaScript API in Google Cloud Console
- Create API key with restrictions
- Enable Places API as well

### Cron Secret
- Generate a random secret for cron job authentication:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### JWT Secret
- Generate a secure random secret:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

## Step 2: Database Setup

1. In your Supabase project, go to SQL Editor

2. Run the schema from `lib/supabase/schema.sql`:
   - Copy the entire contents of the file
   - Paste into SQL Editor
   - Click "Run"

3. Verify tables were created:
   - Check "Table Editor" in Supabase
   - You should see: clients, saved_searches, listings, notifications, client_activity, admins

4. Create your admin user:
   ```sql
   INSERT INTO admins (email, name, password_hash, role)
   VALUES (
     'your-email@domain.com',
     'Your Name',
     '$2a$10$... your bcrypt hashed password ...',
     'admin'
   );
   ```

   To generate password hash, run:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 10));"
   ```

## Step 3: Install Dependencies

```bash
npm install
```

This will install all required packages:
- Next.js, React, TypeScript
- Supabase client
- SendGrid for emails
- bcryptjs for password hashing
- jsonwebtoken for authentication
- date-fns for date utilities

## Step 4: Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Branding Assets

1. Add your logo and branding assets to `/public/branding/`:
   - logo.png or logo.svg
   - logo-white.png (for dark backgrounds)
   - favicon.ico
   - og-image.png (for social media)

2. The README in that folder has specifications for each asset.

## Step 6: Testing

### Test Public Search
1. Go to http://localhost:3000
2. Use search filters
3. Verify compliance notices appear
4. Check that results are limited to 350

### Test Client Registration
1. Go to http://localhost:3000/portal/register
2. Fill out registration form
3. Accept Terms of Use
4. Check email for welcome message with credentials

### Test Client Portal
1. Go to http://localhost:3000/portal/login
2. Login with credentials from email
3. Verify dashboard loads
4. Check saved searches

### Test Admin Dashboard
1. Go to http://localhost:3000/admin
2. Login with admin credentials
3. View client list
4. Test client management features

## Step 7: Bridge API Integration

**IMPORTANT**: The Bridge API integration is currently a placeholder. You need to:

1. Review `lib/services/bridgeApi.ts`
2. Update authentication method based on Bridge Interactive documentation
3. Update endpoints and response parsing
4. Test with sample data first

To test without Bridge API:
- Manually insert sample listings into the `listings` table
- Or create mock data for development

## Step 8: Cron Jobs Setup

### For Vercel Deployment:
The `vercel.json` file is already configured with cron schedules:
- IDX data refresh: Daily at 2:00 AM
- Notification send: Daily at 9:00 AM
- Expiry check: Daily at 10:00 AM

### For Other Hosting:
Set up cron jobs to hit these endpoints daily:
```bash
# Daily at 2am - Refresh IDX data
curl -X POST https://yourdomain.com/api/idx/refresh \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Daily at 9am - Send notifications
curl -X POST https://yourdomain.com/api/notifications/send \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Daily at 10am - Check client expiry
curl -X POST https://yourdomain.com/api/cron/check-expiry \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Step 9: Deployment

### Deploy to Vercel (Recommended):

1. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. Import project in Vercel:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Add all environment variables
   - Deploy

3. Set up custom domain in Vercel dashboard

### Deploy to Netlify:

1. Push code to GitHub

2. Import to Netlify:
   - New site from Git
   - Select repository
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Add environment variables

3. Configure Functions for API routes

## Step 10: Post-Deployment

1. **Test all functionality in production**
   - Public search
   - Client registration and login
   - Admin dashboard
   - Email notifications

2. **Configure DNS**
   - Point your domain to hosting provider
   - Set up SSL certificate (automatic on Vercel/Netlify)

3. **Monitor cron jobs**
   - Check Vercel logs for cron execution
   - Verify daily data refresh is working
   - Test notification emails

4. **Compliance Check**
   - Verify MLS® copyright notice on all pages
   - Confirm 350 result limit is enforced
   - Check Terms of Use click-wrap
   - Test auto-expiry system

## Troubleshooting

### Issue: Database connection fails
- Verify Supabase credentials in `.env.local`
- Check Supabase project is active
- Ensure Row Level Security policies are correct

### Issue: Emails not sending
- Verify SendGrid API key
- Check sender email is verified in SendGrid
- Look for errors in API logs

### Issue: Bridge API not connecting
- Verify API credentials
- Check API endpoint URLs
- Review Bridge Interactive documentation
- Test with Postman first

### Issue: Build fails
- Run `npm install` again
- Check for TypeScript errors: `npm run build`
- Verify all environment variables are set

## Security Checklist

- [ ] All environment variables are set and secure
- [ ] JWT_SECRET is a strong random string
- [ ] CRON_SECRET is set for cron job protection
- [ ] Supabase RLS policies are enabled
- [ ] Admin passwords are hashed with bcrypt
- [ ] HTTPS is enabled in production
- [ ] API rate limiting is configured

## Compliance Checklist

- [ ] MLS® copyright notice on all listing pages
- [ ] Reciprocity links are present
- [ ] 350 result limit is enforced
- [ ] Terms of Use click-wrap is required
- [ ] Client auto-expiry system is working (90/180 days)
- [ ] Data refresh runs every 24 hours
- [ ] Anti-scraping measures are in place
- [ ] Listing brokerage attribution is displayed

## Next Steps

1. **Migrate existing clients**: Import your current client list
2. **Set up saved searches**: Create searches for existing clients
3. **Test notification flow**: Verify clients receive emails
4. **Customize branding**: Update colors, fonts, messaging
5. **Add SEO optimization**: Meta tags, schema markup
6. **Set up analytics**: Google Analytics, conversion tracking
7. **Document admin procedures**: Client onboarding, search setup

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **SendGrid Docs**: https://docs.sendgrid.com
- **Google Maps API**: https://developers.google.com/maps
- **Bridge Interactive**: Contact your account manager

## Quarterly Compliance Reporting

Remember to submit quarterly reports to VREB/VIREB:
- List of all end users
- Report new users immediately via email
- Include: name, brokerage, URL, use type

Contact:
- VIREB: techsupport@vireb.com
- VREB: systems@vreb.org
