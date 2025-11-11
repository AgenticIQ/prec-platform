# PREC Real Estate Platform - Deployment Checklist

## Pre-Deployment Checklist

### Code Readiness
- [ ] All TypeScript errors resolved (`npm run build`)
- [ ] All environment variables documented in `.env.local.example`
- [ ] No console.log statements in production code (or wrapped in dev checks)
- [ ] Error handling implemented for all API routes
- [ ] Loading states implemented for all async operations
- [ ] All components are responsive (mobile, tablet, desktop tested)

### Security
- [ ] JWT_SECRET is a strong random string (32+ characters)
- [ ] CRON_SECRET is set for API endpoint protection
- [ ] Supabase Service Role Key is never exposed to client
- [ ] All sensitive operations use server-side Supabase client
- [ ] Rate limiting middleware is active
- [ ] Anti-scraping protection is enabled
- [ ] HTTPS will be enforced in production
- [ ] Security headers are set in middleware

### Database
- [ ] Supabase project created
- [ ] Database schema deployed (`schema.sql` executed)
- [ ] Row Level Security (RLS) policies enabled
- [ ] Admin user created
- [ ] Test data populated (optional, for testing)
- [ ] Database backups configured in Supabase

### External Services
- [ ] Bridge Interactive API credentials obtained and tested
- [ ] SendGrid account created and sender verified
- [ ] SendGrid API key generated
- [ ] Google Maps API key created with proper restrictions
- [ ] Twilio account created (if using SMS notifications)
- [ ] All API keys added to environment variables

### MLS® Compliance
- [ ] Copyright notice displays on all listing pages
- [ ] Reciprocity links are present and working
- [ ] 350 result limit is enforced in code
- [ ] Terms of Use click-wrap is required for registration
- [ ] Listing brokerage attribution displays on all listings
- [ ] Anti-scraping message is visible
- [ ] Data refresh is scheduled for every 24 hours
- [ ] Client auto-expiry system tested (90/180 days)

## Deployment Steps

### Option 1: Deploy to Vercel (Recommended)

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial deployment"
   git remote add origin https://github.com/yourusername/prec-platform.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Click "Import Project"
   - Select your GitHub repository
   - Framework Preset: Next.js
   - Root Directory: `./` (or prec-platform if in subdirectory)

3. **Configure Environment Variables**
   In Vercel dashboard, add all variables from `.env.local`:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - BRIDGE_API_URL
   - BRIDGE_API_KEY
   - BRIDGE_API_SECRET
   - SENDGRID_API_KEY
   - SENDGRID_FROM_EMAIL
   - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
   - NEXT_PUBLIC_APP_URL (your production URL)
   - JWT_SECRET
   - CRON_SECRET
   - ADMIN_EMAIL

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Vercel will automatically set up cron jobs from `vercel.json`

5. **Configure Custom Domain**
   - In Vercel dashboard: Settings > Domains
   - Add your domain (e.g., properties.prec.ca)
   - Update DNS records as instructed
   - SSL certificate is automatic

### Option 2: Deploy to Netlify

1. **Build command configuration**
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment variables**
   - Add all variables in Netlify dashboard

3. **Configure Functions**
   - API routes will work as Netlify Functions
   - Note: Netlify doesn't have built-in cron, need external service

4. **Set up external cron jobs**
   - Use GitHub Actions or cron-job.org
   - Hit `/api/idx/refresh`, `/api/notifications/send`, `/api/cron/check-expiry` daily

### Cron Jobs Setup

**Vercel** (automatic with `vercel.json`):
- IDX Refresh: Daily at 2:00 AM PST
- Notifications: Daily at 9:00 AM PST
- Expiry Check: Daily at 10:00 AM PST

**Other platforms** - Set up these cron jobs:
```bash
# Daily at 2am PST - Refresh IDX data
0 2 * * * curl -X POST https://yourdomain.com/api/idx/refresh -H "Authorization: Bearer YOUR_CRON_SECRET"

# Daily at 9am PST - Send notifications
0 9 * * * curl -X POST https://yourdomain.com/api/notifications/send -H "Authorization: Bearer YOUR_CRON_SECRET"

# Daily at 10am PST - Check expiry
0 10 * * * curl -X POST https://yourdomain.com/api/cron/check-expiry -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Post-Deployment Verification

### Functionality Tests
- [ ] Homepage loads correctly
- [ ] Search functionality works
- [ ] Property cards display with correct data
- [ ] Copyright notice appears on all listing pages
- [ ] Client registration works
- [ ] Registration confirmation email received
- [ ] Client login works
- [ ] Portal dashboard displays saved searches
- [ ] Admin login works
- [ ] Admin dashboard shows clients
- [ ] Maps display correctly with markers

### Performance Tests
- [ ] Page load times < 3 seconds
- [ ] Images are optimized
- [ ] Lighthouse score > 90
- [ ] Mobile performance is good
- [ ] No console errors in browser

### Security Tests
- [ ] HTTPS is enforced
- [ ] Scraper protection is working (test with curl)
- [ ] Rate limiting prevents abuse
- [ ] JWT tokens expire correctly
- [ ] Client can only see own data
- [ ] Admin routes require authentication

### Compliance Tests
- [ ] 350 result limit is enforced
- [ ] Copyright notice displays
- [ ] Terms of Use requires acceptance
- [ ] Listing brokerage shows on all listings
- [ ] Anti-scraping message displays
- [ ] Data refreshes daily (check cron logs)
- [ ] Client expiry reminders send

## Monitoring Setup

### Set up monitoring services:
1. **Vercel Analytics** (if using Vercel)
   - Enable in dashboard
   - Track page views and performance

2. **Supabase Logs**
   - Monitor database queries
   - Check for errors

3. **SendGrid Email Metrics**
   - Track delivery rates
   - Monitor bounces and complaints

4. **Error Tracking** (optional)
   - Set up Sentry or similar
   - Track JavaScript errors

### Key metrics to monitor:
- Daily active users
- Search queries per day
- Notification emails sent
- Client registrations
- API response times
- Database query performance
- Error rates

## Maintenance Schedule

### Daily:
- Check cron job execution logs
- Verify data refresh completed
- Monitor email delivery

### Weekly:
- Review client activity
- Check expiring clients
- Monitor system performance

### Monthly:
- Review analytics and metrics
- Update property data quality
- Client outreach for renewals

### Quarterly:
- Submit compliance report to VREB/VIREB
- Report new users immediately
- Review and update Terms of Use if needed
- Check for security updates

## Rollback Plan

If deployment fails or critical issues arise:

1. **Vercel**: Use instant rollback
   - Deployments > Previous deployment > Promote to Production

2. **Database issues**:
   - Restore from Supabase backup
   - Check Settings > Database > Backups

3. **API issues**:
   - Revert to last working commit
   - Redeploy

## Support Contacts

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **SendGrid Support**: https://support.sendgrid.com
- **VIREB Tech**: techsupport@vireb.com
- **VREB Systems**: systems@vreb.org

## Success Criteria

Deployment is successful when:
- [ ] All pages load without errors
- [ ] All core features work (search, register, login, portal, admin)
- [ ] Cron jobs execute successfully
- [ ] Emails send correctly
- [ ] No security vulnerabilities
- [ ] All compliance requirements met
- [ ] Performance metrics meet targets
- [ ] Domain and SSL configured
- [ ] Monitoring is active

## Next Steps After Deployment

1. **Import existing clients** from your current system
2. **Create saved searches** for migrated clients
3. **Test notification flow** end-to-end
4. **Train on admin features** (client management, search creation)
5. **Set up analytics goals** and conversion tracking
6. **Create user documentation** for clients
7. **Schedule first compliance report** (quarterly)
8. **Plan for ongoing feature development**
