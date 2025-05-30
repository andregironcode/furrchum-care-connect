import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil', // Use the latest API version
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { bookingData } = req.body;

    if (!bookingData) {
      return res.status(400).json({ error: 'Missing booking data' });
    }

    // Calculate the price with a 5% service fee
    const amount = Math.round(bookingData.fee * 1.05 * 100); // Convert to paise (smallest unit of INR)

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr', // Using INR for Indian Rupees
            product_data: {
              name: `Consultation with ${bookingData.vetName}`,
              description: `${bookingData.consultationMode.toUpperCase()} consultation on ${bookingData.date} at ${bookingData.timeSlot}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        vet_id: bookingData.vetId,
        pet_id: bookingData.petId,
        consultation_type: bookingData.consultationType,
        consultation_mode: bookingData.consultationMode,
        date: bookingData.date,
        time_slot: bookingData.timeSlot,
      },
      mode: 'payment',
      success_url: `${process.env.VITE_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL}/booking/${bookingData.vetId}`,
    });

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
