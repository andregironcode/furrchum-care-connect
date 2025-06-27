# Google Analytics Setup Guide

This guide explains how to set up Google Analytics 4 (GA4) for the FurrCare application.

## 🚀 Quick Setup

### 1. Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click "Start measuring"
4. Create a new account for your website
5. Set up a new property for your website
6. Choose "Web" as the platform
7. Enter your website URL (e.g., `https://furrchum.com`)
8. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)

### 2. Add Environment Variable

Add your Google Analytics Measurement ID to your environment file:

```bash
# In your .env file
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

### 3. Deploy Changes

The Google Analytics integration is already implemented in the codebase. Just deploy with the environment variable set.

## 📊 What's Being Tracked

### Page Views
- Automatic tracking of all page navigation
- Route changes within the app
- Page titles and paths

### User Authentication Events
- User sign up (with user type: pet_owner/vet)
- User sign in (with user type)
- User sign out
- SuperAdmin login

### Vet Directory Events
- Vet profile views (with vet ID)
- Search performed (search terms and ZIP codes)
- Filter usage

### Booking Events
- Appointment booking initiated
- Appointment cancellations
- Payment events (initiated, completed, failed)

### Content Engagement
- Blog post views
- FAQ page visits
- Document downloads

### Video Call Events
- Video calls started
- Video calls ended (with duration)

### Admin Events (SuperAdmin)
- Admin login attempts
- Admin actions performed
- User management activities

### Error Tracking
- System errors
- API failures
- Authentication issues

## 🔧 Custom Event Implementation

To add custom tracking to new features:

```typescript
import { trackUserActions, trackEvent } from '@/utils/analytics';

// Use predefined tracking functions
trackUserActions.appointmentBooked(vetId, consultationType);
trackUserActions.paymentCompleted(amount, method);

// Or create custom events
trackEvent('custom_action', 'category', 'label', value);
```

## 📈 Available Analytics Functions

### Basic Tracking
- `trackPageView(path, title)` - Track page views
- `trackEvent(action, category, label, value)` - Track custom events

### Predefined User Actions
- `trackUserActions.userSignUp(userType)`
- `trackUserActions.userSignIn(userType)`
- `trackUserActions.userSignOut()`
- `trackUserActions.appointmentBooked(vetId, type)`
- `trackUserActions.paymentCompleted(amount, method)`
- `trackUserActions.vetProfileViewed(vetId)`
- `trackUserActions.vetSearchPerformed(searchTerm)`
- `trackUserActions.errorOccurred(type, message)`

## 🛠️ Development vs Production

### Development Mode
- Analytics runs in test mode
- Events are logged to console
- No data sent to production GA property

### Production Mode
- Full analytics tracking enabled
- Events sent to Google Analytics
- Real user data collection

## 🔒 Privacy Considerations

The implementation includes:
- No personally identifiable information (PII) tracking
- User consent compliance ready
- GDPR-friendly setup
- Only tracking essential user interactions

## 📋 Verification

After deployment, verify tracking works:

1. Visit your website
2. Check Google Analytics Real-time reports
3. Look for events appearing in the dashboard
4. Monitor custom events in GA4 Events section

## 🎯 Key Metrics to Monitor

### Business Metrics
- User sign-ups by type (pet owners vs vets)
- Appointment booking conversion rate
- Payment completion rate
- Vet profile engagement

### Technical Metrics
- Page load performance
- Error rates
- User journey completion
- Feature adoption

### Content Metrics
- Popular vet specializations
- Most viewed vet profiles
- Search terms and patterns
- Geographic user distribution

## 🔧 Troubleshooting

### Common Issues

1. **No data appearing in GA**
   - Check environment variable is set correctly
   - Verify Measurement ID format (G-XXXXXXXXXX)
   - Check browser console for errors

2. **Events not tracking**
   - Verify analytics initialization in App.tsx
   - Check network tab for GA requests
   - Ensure tracking functions are imported correctly

3. **Development vs Production**
   - Test mode is enabled in development
   - Check console logs for tracking confirmation
   - Use GA4 DebugView for testing

### Debug Commands

```bash
# Check environment variables
echo $VITE_GA_TRACKING_ID

# Verify build includes analytics
npm run build && grep -r "analytics" dist/

# Test analytics in browser console
localStorage.getItem('ga-disable-G-XXXXXXXXXX')
```

## 📚 Additional Resources

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [React GA4 Library](https://github.com/PriceRunner/react-ga4)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [GDPR Compliance Guide](https://support.google.com/analytics/answer/9019185) 