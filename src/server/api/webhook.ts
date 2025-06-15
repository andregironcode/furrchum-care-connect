import { Request, Response } from 'express';
import { supabase, getRawBody, verifyRazorpayWebhook } from '../api-middleware';

export const razorpayWebhook = async (req: Request, res: Response) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the raw request body as a string for signature verification
    const buf = await getRawBody(req);
    const rawBody = buf.toString('utf8');
    
    // Get the Razorpay signature from the headers
    const signature = req.headers['x-razorpay-signature'] as string;
    
    if (!signature) {
      console.warn('Missing Razorpay signature');
      return res.status(400).json({ error: 'Missing signature' });
    }
    
    // Verify the webhook signature
    try {
      const isValid = verifyRazorpayWebhook(rawBody, signature);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return res.status(400).json({ error: 'Invalid signature' });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`Webhook signature verification failed: ${errorMessage}`);
      return res.status(400).send(`Webhook Error: ${errorMessage}`);
    }

    // Parse the webhook body
    const event = JSON.parse(rawBody);
    
    // Handle specific events
    if (event.event === 'payment.authorized' || event.event === 'payment.captured') {
      const payload = event.payload?.payment?.entity;
      
      if (!payload || !payload.order_id) {
        console.error('Invalid payload structure', event);
        return res.status(400).json({ error: 'Invalid payload structure' });
      }
      
      // Get the order details to extract metadata
      const orderId = payload.order_id;
      const amount = payload.amount / 100; // Convert from paise to rupees
      const paymentId = payload.id;
      
      // Fetch the order from your database or via Razorpay API to get notes
      // For this implementation, we'll assume the order notes contain the booking_id and user_id
      // In a real implementation, you might want to fetch the order from Razorpay's API
      const { booking_id, user_id, meeting_details } = payload.notes || {};
      
      if (!booking_id || !user_id) {
        console.error('Missing required notes in webhook', payload.notes);
        return res.status(400).json({ error: 'Missing required notes' });
      }

      // Get customer information
      const customerEmail = payload.email || '';
      
      // Update existing booking to confirmed
      let parsedMeetingDetails: {
        meetingId: string;
        roomUrl: string;
        hostRoomUrl: string | null;
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
        updated_at: new Date().toISOString(),
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId
      };
      
      // Add meeting details if they exist and aren't already in the database
      if (parsedMeetingDetails) {
        updateData.meeting_id = parsedMeetingDetails.meetingId;
        updateData.meeting_url = parsedMeetingDetails.roomUrl;
        updateData.host_meeting_url = parsedMeetingDetails.hostRoomUrl;
      }
      
      // Update the booking
      const { data: bookingData, error: updateError } = await supabase
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
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          booking_id: bookingData.id,
          payment_intent_id: paymentId,
          amount: amount,
          currency: payload.currency || 'INR',
          status: 'completed',
          payment_method: payload.method || 'card',
          customer_email: customerEmail,
          created_at: new Date().toISOString(),
          pet_owner_id: user_id,
          provider: 'razorpay',
          provider_payment_id: paymentId,
          provider_order_id: orderId
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
