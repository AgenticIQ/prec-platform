# PREC Real Estate Platform

A custom real estate search platform with client portal system for Victoria BC and Vancouver Island, integrating with VIVA MLS® System IDX data.

**Status:** Ready for deployment

## Features

### Public Website
- **Property Search**: Advanced search with filters (location, price, property type, features)
- **IDX Integration**: Real-time MLS® data from Bridge Interactive API
- **Interactive Maps**: Google Maps integration with property markers
- **SEO Optimized**: Lead capture and conversion-focused design
- **MLS® Compliant**: Full compliance with VIVA system regulations

### Client Portal (VOW)
- **Secure Authentication**: Password-protected client accounts
- **Saved Searches**: Personalized search criteria management
- **Automated Notifications**: Daily email alerts for new matching listings
- **Dashboard**: View recent properties and search activity
- **Terms of Use**: Required click-wrap agreement
- **Auto-Expiry**: 90-day default with 180-day maximum

### Admin Dashboard
- **Client Management**: Add, edit, and monitor client accounts
- **Search Management**: Create and manage saved searches for clients
- **Activity Tracking**: Monitor client logins and engagement
- **Expiry Management**: Track and extend client access
- **Reporting**: Quarterly compliance reports for MLS® boards

### Automated Services
- **Daily Data Refresh**: Updates listings every 24 hours
- **Notification Engine**: Sends emails when new properties match criteria
- **Expiry Reminders**: Automatic emails at 14 and 7 days before expiry
- **Anti-Scraping**: Protection against data harvesting

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT + bcrypt
- **Email**: SendGrid
- **Maps**: Google Maps JavaScript API
- **IDX Data**: Bridge Interactive API (VIVA MLS® System)
- **Hosting**: Vercel (recommended) or Netlify

## Quick Start

1. **Clone and install**:
   ```bash
   cd prec-platform
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Set up database**:
   - Create Supabase project
   - Run `lib/supabase/schema.sql` in SQL Editor

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

## Documentation

- **[SETUP.md](./SETUP.md)** - Comprehensive setup guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment checklist and instructions
- **[PROJECT_BRIEF.md](../PROJECT_BRIEF.md)** - Full project requirements
- **[META_PROMPT.md](../META_PROMPT.md)** - Development context

## Project Structure

```
prec-platform/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Home page (public search)
│   ├── portal/              # Client portal pages
│   │   ├── login/
│   │   ├── register/
│   │   └── dashboard/
│   ├── admin/               # Admin dashboard
│   └── api/                 # API routes
│       ├── idx/             # IDX integration
│       ├── auth/            # Authentication
│       ├── clients/         # Client management
│       ├── notifications/   # Email notifications
│       └── cron/            # Scheduled jobs
├── components/              # React components
│   ├── public/             # Public-facing components
│   ├── portal/             # Client portal components
│   └── admin/              # Admin components
├── lib/                     # Utilities and services
│   ├── services/           # Business logic
│   │   ├── bridgeApi.ts   # Bridge API integration
│   │   ├── searchService.ts
│   │   └── notificationService.ts
│   ├── supabase/           # Database
│   │   ├── client.ts
│   │   └── schema.sql
│   ├── constants/          # Constants and compliance
│   ├── types/              # TypeScript types
│   └── utils/              # Helper functions
├── public/                  # Static assets
│   ├── branding/           # Logo and brand assets
│   └── images/
├── middleware.ts            # Anti-scraping and security
├── vercel.json             # Cron job configuration
└── package.json
```

## Key Features Detail

### MLS® Compliance
- Copyright notice on every page with listing data
- Listing brokerage attribution on all properties
- 350 result limit per search (enforced in code)
- 24-hour data refresh requirement
- Terms of Use click-wrap for portal access
- Client auto-expiry system (90/180 days)
- Anti-scraping protection

### Security
- JWT-based authentication
- Bcrypt password hashing
- HTTP-only cookies
- Rate limiting middleware
- Row Level Security (RLS) in database
- HTTPS enforcement
- Security headers

### Performance
- Server-side rendering (SSR)
- Image optimization
- Code splitting
- API route caching
- Indexed database queries

## Environment Variables

Required environment variables (see `.env.local.example`):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Bridge Interactive API
BRIDGE_API_URL=
BRIDGE_API_KEY=
BRIDGE_API_SECRET=

# SendGrid
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Application
NEXT_PUBLIC_APP_URL=
JWT_SECRET=
CRON_SECRET=
ADMIN_EMAIL=
```

## Cron Jobs

Three scheduled jobs (configured in `vercel.json`):

1. **IDX Data Refresh** - Daily at 2:00 AM
   - Fetches latest listings from Bridge API
   - Updates local database
   - Removes stale data

2. **Send Notifications** - Daily at 9:00 AM
   - Checks saved searches for new matches
   - Sends email notifications to clients
   - Records notification history

3. **Check Expiry** - Daily at 10:00 AM
   - Expires accounts past expiry date
   - Sends 14-day and 7-day reminders
   - Logs expiry events

## API Routes

### Public
- `POST /api/idx/search` - Search properties

### Authentication
- `POST /api/auth/login` - Client login
- `POST /api/clients/register` - Client registration

### Portal (Authenticated)
- `GET /api/portal/dashboard` - Client dashboard data
- `GET /api/portal/searches` - Saved searches

### Admin (Authenticated)
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/clients` - Client list
- `POST /api/admin/clients` - Create client

### Cron Jobs
- `POST /api/idx/refresh` - Daily data refresh
- `POST /api/notifications/send` - Send notifications
- `POST /api/cron/check-expiry` - Check client expiry

## Database Schema

Tables:
- `clients` - Client accounts
- `saved_searches` - Saved search criteria
- `listings` - Cached IDX property data
- `notifications` - Notification history
- `client_activity` - Activity logs
- `admins` - Admin users

See `lib/supabase/schema.sql` for full schema.

## Development

### Run tests:
```bash
npm run test
```

### Build for production:
```bash
npm run build
```

### Start production server:
```bash
npm start
```

### Lint code:
```bash
npm run lint
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment instructions.

Quick deploy to Vercel:
```bash
git push origin main
# Then import to Vercel dashboard
```

## Compliance & Legal

### MLS® Data Usage
This platform complies with:
- Vancouver Island Real Estate Board (VIREB) rules
- Victoria Real Estate Board (VREB) rules
- "Rules Governing Acceptable Use of the Boards' Data"

### Quarterly Reporting
Required to submit quarterly reports to VREB/VIREB:
- List of all end users
- New users must be reported immediately
- Contact: techsupport@vireb.com, systems@vreb.org

### Data Use Agreement
Must have executed Data Use Agreement with Boards before accessing IDX feed.

## Support

### External Services
- **VIREB Tech Support**: techsupport@vireb.com
- **VREB Systems**: systems@vreb.org
- **Bridge Interactive**: Your account manager

### Platform Issues
- Check [SETUP.md](./SETUP.md) for troubleshooting
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
- Check Vercel logs for production errors
- Review Supabase logs for database issues

## License

Proprietary - PREC Real Estate

## Version

Current Version: 1.0.0 (MVP)

## Credits

Built for PREC Real Estate
Platform: Next.js + Supabase + TypeScript
