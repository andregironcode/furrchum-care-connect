import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { supabase } from '@/integrations/supabase/client';

// Disable body parsing, we need the raw body for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const buf = await buffer(req);
    const signature = req.headers['stripe-signature'] as string;

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        buf.toString(),
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle specific events
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Extract metadata from the session
      const { vet_id, pet_id, consultation_type, consultation_mode, date, time_slot } = session.metadata || {};
      
      if (!vet_id || !pet_id) {
        return res.status(400).json({ error: 'Missing required metadata' });
      }

      // Get customer information
      const customerId = session.customer as string;
      let customerEmail = session.customer_details?.email || '';
      
      // Create booking in Supabase
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          vet_id: vet_id,
          pet_id: pet_id,
          pet_owner_id: session.client_reference_id, // Set from client
          booking_date: date,
          start_time: time_slot?.split('-')[0].trim(),
          end_time: time_slot?.split('-')[1].trim(),
          consultation_type: consultation_type,
          status: 'confirmed',
          notes: `${consultation_mode} consultation`,
        })
        .select()
        .single();

      if (bookingError) {
        console.error('Error creating booking:', bookingError);
        return res.status(500).json({ error: 'Failed to create booking' });
      }

      // Record the transaction in Supabase
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          booking_id: bookingData.id,
          payment_intent_id: session.payment_intent as string,
          amount: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
          currency: session.currency,
          status: 'completed',
          payment_method: 'card',
          customer_email: customerEmail,
        });

      if (transactionError) {
        console.error('Error recording transaction:', transactionError);
        return res.status(500).json({ error: 'Failed to record transaction' });
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
}
