// Middleware for anti-scraping and security
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of known scraper user agents
const SCRAPER_USER_AGENTS = [
  'scrapy',
  'crawler',
  'spider',
  'bot',
  'scraper',
  'python-requests',
  'curl',
  'wget',
  'http',
];

// Rate limiting store (in production, use Redis or similar)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const pathname = request.nextUrl.pathname;

  // Skip anti-scraping checks for test/admin endpoints
  const isTestEndpoint = pathname.startsWith('/api/test/') || pathname.startsWith('/api/cron/');

  // Check for known scraper user agents (skip for test endpoints)
  const isScraper = !isTestEndpoint && SCRAPER_USER_AGENTS.some(agent => userAgent.includes(agent));

  if (isScraper) {
    console.warn(`Potential scraper detected from IP: ${ip}, User-Agent: ${userAgent}`);

    // Return 403 Forbidden for scrapers
    return new NextResponse(
      JSON.stringify({
        error: 'Access Denied',
        message: 'This information is for consumer use only and may not be used for any purpose other than to identify prospective properties consumers may be interested in purchasing.',
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // Rate limiting - Allow 100 requests per 15 minutes per IP
  const now = Date.now();
  const limit = 100;
  const windowMs = 15 * 60 * 1000; // 15 minutes

  const requestData = requestCounts.get(ip);

  if (requestData) {
    if (now < requestData.resetTime) {
      if (requestData.count >= limit) {
        console.warn(`Rate limit exceeded for IP: ${ip}`);

        return new NextResponse(
          JSON.stringify({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(Math.ceil((requestData.resetTime - now) / 1000)),
            },
          }
        );
      }

      requestData.count++;
    } else {
      // Reset window
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    }
  } else {
    // First request from this IP
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
  }

  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    // 1% chance on each request
    for (const [key, value] of requestCounts.entries()) {
      if (now > value.resetTime) {
        requestCounts.delete(key);
      }
    }
  }

  // Security headers
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self)'
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
