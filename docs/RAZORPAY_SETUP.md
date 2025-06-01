# Razorpay Integration Setup

This document outlines how to properly set up Razorpay integration for FurrChum Care Connect.

## Configuration Steps

1. **Register at Razorpay**
   - Create an account at [Razorpay](https://razorpay.com/)
   - Get your API key and secret from the Dashboard

2. **Environment Variables**
   - Add the following to your `.env` file:
   ```
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret_key
   ```

3. **Server Setup**
   - Ensure the server.js file includes the Razorpay endpoints
   - Install the required dependencies: `npm install razorpay`

4. **Testing**
   - Use Razorpay test mode for development
   - Test credentials:
     - Card Number: 4111 1111 1111 1111
     - Expiry: Any future date
     - CVV: Any 3 digits
     - OTP: 1234

## Troubleshooting

If you encounter the error: `Failed to load resource: net::ERR_INVALID_URL` or `Failed to create checkout session`:

1. Verify that your server is running with `npm run server`
2. Check that the API keys are correctly set in the `.env` file
3. Ensure the Razorpay script is loading properly
4. Verify that the API endpoints are correctly implemented in server.js

## API Endpoints

The server implements two main endpoints for Razorpay integration:

1. **Create Checkout Session (`/api/create-checkout-session`)**
   - Creates a new Razorpay order
   - Requires booking data with pricing information

2. **Verify Payment (`/api/verify-payment`)**
   - Verifies the signature of a completed payment
   - Updates the booking status upon successful payment
