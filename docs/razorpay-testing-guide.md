# Razorpay Testing Guide

This guide provides information on how to test the Razorpay payment integration in FurrChum Care Connect.

## Test Credentials

When in test mode, use the following test credentials:

### Test API Keys

These keys are already configured in the application:

- **Key ID**: `rzp_test_*************`
- **Key Secret**: `*************`

### Test Cards

You can use the following test cards to simulate different payment scenarios:

| Card Network | Card Number      | CVV | Expiry Date | 3D Secure | Result      |
|--------------|------------------|-----|-------------|-----------|-------------|
| Visa         | 4111 1111 1111 1111 | Any | Any         | No        | Success     |
| MasterCard   | 5267 3181 8797 5449 | Any | Any         | No        | Success     |
| Visa         | 4000 0000 0000 3220 | Any | Any         | Yes       | Success     |
| MasterCard   | 5204 0000 0000 0131 | Any | Any         | Yes       | Success     |
| Visa         | 4000 0000 0000 0002 | Any | Any         | No        | Declined    |

### Test UPI IDs

You can use the following test UPI IDs:

- `success@razorpay` - For successful payments
- `failure@razorpay` - For failed payments

## Testing Flow

1. **Create a booking**:
   - Go through the normal booking flow by selecting a vet, pet, time slot, etc.
   - Proceed to the payment page

2. **Initiate a payment**:
   - On the payment page, click "Pay" to initiate the Razorpay checkout
   - The Razorpay checkout modal will appear

3. **For Card Payments**:
   - Enter one of the test card numbers from the table above
   - Enter any CVV (e.g., 123)
   - Enter any future expiry date (e.g., 12/25)
   - If the card has 3D secure, you'll be prompted to complete the authentication
   - For 3D secure, just click "Success" on the authentication page

4. **For UPI Payments**:
   - Enter one of the test UPI IDs from above
   - Click "Pay Now"
   - In test mode, you'll see a success/failure message based on the UPI ID used

5. **Post-Payment**:
   - For successful payments, you'll be redirected to the payment success page
   - For failed payments, you'll see an error message

## Webhook Testing

Razorpay webhooks can be tested using the Razorpay Dashboard:

1. Log in to the Razorpay Dashboard
2. Navigate to Settings > Webhooks
3. Select the webhook you want to test
4. Click "Test Webhook"
5. Select an event type (e.g., payment.authorized, payment.captured)
6. Click "Send Test Webhook"

## Common Test Scenarios

1. **Successful Payment**:
   - Use card number 4111 1111 1111 1111 or UPI ID success@razorpay
   - Verify the booking is marked as confirmed
   - Verify a transaction record is created

2. **Failed Payment**:
   - Use card number 4000 0000 0000 0002 or UPI ID failure@razorpay
   - Verify the booking remains in pending state
   - Verify no transaction record is created

3. **3D Secure Authentication**:
   - Use card number 4000 0000 0000 3220
   - Complete the 3D secure authentication
   - Verify the payment is processed successfully

4. **Webhook Processing**:
   - Create a test payment
   - Trigger a test webhook from the Razorpay Dashboard
   - Verify the application processes the webhook correctly

## Troubleshooting

If you encounter issues during testing:

1. Check the browser console for errors
2. Check the server logs for detailed error messages
3. Verify the Razorpay API keys are correctly configured
4. Ensure the webhook URL is correctly set up in the Razorpay Dashboard
5. Verify the webhook secret is correctly configured

For detailed information about Razorpay's test mode, refer to the [Razorpay Documentation](https://razorpay.com/docs/payments/payments/test-mode/).
