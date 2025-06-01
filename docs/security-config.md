# Security Configuration Guide

## SSL/TLS Configuration

### Web Server SSL Configuration

If you're using Nginx as a reverse proxy:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    
    # Modern configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # HSTS (ngx_http_headers_module is required) (63072000 seconds = 2 years)
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    
    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Verify chain of trust of OCSP response using Root CA and Intermediate certs
    ssl_trusted_certificate /path/to/fullchain.pem;
    
    # Other security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'; connect-src 'self' https://api.whereby.dev https://api.stripe.com; script-src 'self' https://js.stripe.com; frame-src https://*.whereby.com https://js.stripe.com; img-src 'self' data: https://*.whereby.com; style-src 'self' 'unsafe-inline';" always;
    
    # Proxy to your application
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}
```

### Obtaining SSL Certificates

Use Let's Encrypt to obtain free SSL certificates:

1. Install Certbot: `sudo apt-get install certbot python3-certbot-nginx`
2. Obtain a certificate: `sudo certbot --nginx -d your-domain.com`
3. Set up auto-renewal: `sudo certbot renew --dry-run`

## Content Security Policy (CSP)

Add the following middleware to your Express server:

```javascript
// In src/server/index.ts
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "connect-src 'self' https://api.whereby.dev https://api.stripe.com; " +
    "script-src 'self' https://js.stripe.com; " +
    "frame-src https://*.whereby.com https://js.stripe.com; " +
    "img-src 'self' data: https://*.whereby.com; " +
    "style-src 'self' 'unsafe-inline';"
  );
  next();
});
```

## CSRF Protection

Add a CSRF protection middleware to your Express server:

```javascript
// Install: npm install csurf
import csurf from 'csurf';

const csrfProtection = csurf({ 
  cookie: { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  } 
});

// Apply to routes that need protection
app.post('/api/sensitive-endpoint', csrfProtection, (req, res) => {
  // Handler logic
});
```

## Rate Limiting

Implement rate limiting to prevent abuse:

```javascript
// Install: npm install express-rate-limit
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to all API routes
app.use('/api/', apiLimiter);

// Stricter limits for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 login attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts, please try again after an hour'
});

app.use('/api/auth/login', authLimiter);
```

## Secure Headers

Use Helmet to set secure HTTP headers:

```javascript
// Install: npm install helmet
import helmet from 'helmet';

app.use(helmet());
```

## Regular Security Audits

Schedule regular security audits:

1. Run automated dependency vulnerability scans: `npm audit`
2. Update dependencies: `npm update`
3. Review Supabase Row Level Security policies
4. Review user access controls and permissions
5. Check for exposed API keys and secrets
