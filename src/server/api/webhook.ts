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
      const { booking_id, user_id, meeting_details } = session.metadata || {};
      
      if (!booking_id || !user_id) {
        console.error('Missing required metadata in webhook', session.metadata);
        return res.status(400).json({ error: 'Missing required metadata' });
      }

      // Get customer information
      const customerId = session.customer;
      const customerEmail = session.customer_details?.email || '';
      
      // Update existing booking to confirmed
      let parsedMeetingDetails: {
        meetingId: string;
        roomUrl: string;
        hostRoomUrl: string | null;
        startDate: string;
        endDate: string;
      } | null = null;
      
      // Try to parse meeting details if they exist
      if (meeting_details) {
        try {
          const parsed = JSON.parse(meeting_details);
          if (parsed && typeof parsed === 'object' && 'meetingId' in parsed) {
            parsedMeetingDetails = parsed as {
              meetingId: string;
              roomUrl: string;
              hostRoomUrl: string | null;
              startDate: string;
              endDate: string;
            };
          }
        } catch (e) {
          console.warn('Could not parse meeting details', e);
        }
      }
      
      // Update the booking status to confirmed
      const updateData: Record<string, string | boolean | null | Date> = {
        status: 'confirmed',
        payment_status: 'paid',
        updated_at: new Date().toISOString()
      };
      
      // Add meeting details if they exist and aren't already in the database
      if (parsedMeetingDetails) {
        updateData.meeting_id = parsedMeetingDetails.meetingId;
        updateData.meeting_url = parsedMeetingDetails.roomUrl;
        updateData.host_meeting_url = parsedMeetingDetails.hostRoomUrl;
      }
      
      // Update the booking
      const { data: bookingData, error: updateError } = await supabaseAdmin
        .from('bookings')
        .update(updateData)
        .eq('id', booking_id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating booking:', updateError);
        return res.status(500).json({ error: 'Failed to update booking' });
      }
      
      if (!bookingData) {
        console.error('No booking found with ID:', booking_id);
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Record the transaction in Supabase
      const { error: transactionError } = await supabaseAdmin
        .from('transactions')
        .insert({
          booking_id: bookingData.id,
          payment_intent_id: session.payment_intent,
          amount: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
          currency: session.currency || 'usd',
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
