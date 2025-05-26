import { Request, Response } from 'express';
import { stripe, parseBody } from '../api-middleware';

export const createCheckoutSession = async (req: Request, res: Response) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = await parseBody(req);
    const { bookingData } = body;

    if (!bookingData) {
      return res.status(400).json({ error: 'Missing booking data' });
    }

    // Calculate the price with a 5% service fee
    const amount = Math.round(bookingData.fee * 1.05 * 100); // Convert to cents

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr', // Using INR for Indian Rupees
            product_data: {
              name: `Consultation with ${bookingData.vetName}`,
              description: `${bookingData.consultationMode.toUpperCase()} consultation on ${bookingData.date || 'scheduled date'} at ${bookingData.timeSlot}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        vet_id: bookingData.vetId,
        pet_id: bookingData.petId,
        user_id: bookingData.userId, // Store the user ID
        consultation_type: bookingData.consultationType,
        consultation_mode: bookingData.consultationMode,
        date: bookingData.date || '',
        time_slot: bookingData.timeSlot,
      },
      client_reference_id: bookingData.userId, // Set user ID as reference
      mode: 'payment',
      success_url: `${import.meta.env.VITE_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${import.meta.env.VITE_APP_URL}/booking/${bookingData.vetId}`,
    });

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};
