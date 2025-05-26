import { Request, Response } from 'express';
import { stripe, supabaseAdmin, getRawBody } from '../api-middleware';

export const stripeWebhook = async (req: Request, res: Response) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const buf = await getRawBody(req);
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = import.meta.env.VITE_STRIPE_WEBHOOK_SECRET || '';

    if (!webhookSecret) {
      console.warn('Missing Stripe webhook secret');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        buf,
        signature,
        webhookSecret
      );
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`Webhook signature verification failed: ${errorMessage}`);
      return res.status(400).send(`Webhook Error: ${errorMessage}`);
    }

    // Handle specific events
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Extract metadata from the session
      const { vet_id, pet_id, user_id, consultation_type, consultation_mode, date, time_slot } = session.metadata || {};
      
      if (!vet_id || !pet_id || !user_id) {
        console.error('Missing required metadata in webhook', session.metadata);
        return res.status(400).json({ error: 'Missing required metadata' });
      }

      // Get customer information
      const customerId = session.customer;
      const customerEmail = session.customer_details?.email || '';
      
      // First check if there's already a pending booking
      const { data: existingBookings, error: lookupError } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('vet_id', vet_id)
        .eq('pet_id', pet_id)
        .eq('pet_owner_id', user_id)
        .eq('status', 'pending')
        .eq('booking_date', date)
        .eq('start_time', time_slot?.split('-')[0]?.trim())
        .limit(1);

      // Determine if we need to create a new booking or update existing one
      let bookingData;
      if (existingBookings && existingBookings.length > 0) {
        // Update existing booking to confirmed
        const { data, error } = await supabaseAdmin
          .from('bookings')
          .update({
            status: 'confirmed',
            payment_status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingBookings[0].id)
          .select()
          .single();

        if (error) {
          console.error('Error updating booking:', error);
          return res.status(500).json({ error: 'Failed to update booking' });
        }
        
        bookingData = data;
      } else {
        // Create a new booking
        const { data, error } = await supabaseAdmin
          .from('bookings')
          .insert({
            vet_id: vet_id,
            pet_id: pet_id,
            pet_owner_id: user_id,
            booking_date: date,
            start_time: time_slot?.split('-')[0]?.trim(),
            end_time: time_slot?.split('-')[1]?.trim(),
            consultation_type: consultation_type,
            consultation_mode: consultation_mode,
            status: 'confirmed',
            payment_status: 'paid',
            notes: `${consultation_mode} consultation`,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating booking:', error);
          return res.status(500).json({ error: 'Failed to create booking' });
        }
        
        bookingData = data;
      }

      // Record the transaction in Supabase
      const { error: transactionError } = await supabaseAdmin
        .from('transactions')
        .insert({
          booking_id: bookingData.id,
          payment_intent_id: session.payment_intent,
          amount: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
          currency: session.currency,
          status: 'completed',
          payment_method: 'card',
          customer_email: customerEmail,
          created_at: new Date().toISOString(),
          user_id: user_id
        });

      if (transactionError) {
        console.error('Error recording transaction:', transactionError);
        return res.status(500).json({ error: 'Failed to record transaction' });
      }
      
      // Successfully processed
      console.log(`Payment for booking ${bookingData.id} processed successfully!`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
};
