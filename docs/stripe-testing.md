# Stripe Payment Testing Guide

## Test Cards

Use these test card numbers to verify different payment scenarios:

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 9995 | Insufficient funds |
| 4000 0025 0000 3155 | Requires authentication (3D Secure) |
| 4000 0000 0000 0002 | Card declined |

For all test cards, use:

- Any future expiration date (e.g., 12/25)
- Any 3-digit CVC
- Any postal code

## Testing Checklist

1. **Test Successful Payment**
   - Create a booking
   - Use the successful test card number
   - Verify redirection to success page
   - Check database for updated booking status

2. **Test Failed Payment**
   - Create a booking
   - Use the declined card number
   - Verify error handling
   - Check that booking is marked as unpaid

3. **Test Webhook Processing**
   - Create a test webhook event in Stripe Dashboard
   - Send to your webhook endpoint
   - Verify proper handling in logs
   - Check database for appropriate updates

4. **Test Refund Process**
   - Process a refund through Stripe Dashboard
   - Verify webhook catches the refund event
   - Check database for refund status update

## Production Transition

Before going to production:

1. Switch API keys from test to live in environment variables
2. Verify webhook endpoints are updated for production
3. Test a small real transaction if possible
4. Monitor the first few live transactions closely
