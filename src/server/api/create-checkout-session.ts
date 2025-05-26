import { Request, Response } from 'express';
import { razorpayInstance, parseBody } from '../api-middleware';

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
    const amount = Math.round(bookingData.fee * 1.05 * 100); // Convert to paise (Indian currency subunit)

    // Create Razorpay Order
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `booking_${bookingData.bookingId}`,
      notes: {
        booking_id: bookingData.bookingId, // Store the booking ID for the webhook
        user_id: bookingData.userId,       // Store the user ID
        // Store additional metadata for reference
        vet_id: bookingData.vetId,
        pet_id: bookingData.petId,
        consultation_mode: bookingData.consultationMode,
        date: bookingData.date || '',
        time_slot: bookingData.timeSlot,
        // Include meeting details if available (limited to fit within Razorpay notes)
        meeting_details: bookingData.meetingDetails ? 
          JSON.stringify({
            meetingId: bookingData.meetingDetails.meetingId,
            roomUrl: bookingData.meetingDetails.roomUrl,
            hostRoomUrl: bookingData.meetingDetails.hostRoomUrl
          }) : ''
      }
    };

    const order = await razorpayInstance.orders.create(options);
    
    // Return the order details to the client
    // The client will use this to initialize the Razorpay checkout form
    res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.VITE_RAZORPAY_KEY_ID || '',
      // Include necessary booking information
      booking: {
        id: bookingData.bookingId,
        vetName: bookingData.vetName,
        consultationMode: bookingData.consultationMode,
        date: bookingData.date,
        timeSlot: bookingData.timeSlot,
        fee: (amount / 100).toFixed(2) // Convert back to rupees for display
      }
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};
