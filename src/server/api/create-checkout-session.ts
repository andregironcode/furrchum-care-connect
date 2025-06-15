import { Request, Response } from 'express';
import Razorpay from 'razorpay';

// Get environment variables with fallbacks
const getRazorpayConfig = () => {
  // Try both VITE_ prefixed and non-prefixed versions
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured');
  }
  
  return { keyId, keySecret };
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { bookingData } = req.body;
    
    if (!bookingData) {
      return res.status(400).json({ error: 'Booking data is required' });
    }
    
    // Get Razorpay configuration
    const { keyId, keySecret } = getRazorpayConfig();
    
    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    
    // Calculate amounts (in paise for Razorpay)
    const consultationFee = bookingData.fee || 500;
    const serviceFee = Math.round(consultationFee * 0.05); // 5% service fee
    const totalAmount = consultationFee + serviceFee;
    const amountInPaise = totalAmount * 100; // Convert to paise
    
    // Create Razorpay order
    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `booking_${bookingData.bookingId}_${Date.now()}`,
      notes: {
        booking_id: bookingData.bookingId,
        vet_id: bookingData.vetId,
        pet_id: bookingData.petId,
        consultation_type: bookingData.consultationType,
        user_id: bookingData.userId,
      },
    };
    
    console.log('Creating Razorpay order with options:', orderOptions);
    
    const order = await razorpay.orders.create(orderOptions);
    
    console.log('Razorpay order created successfully:', order);
    
    // Return the order details
    return res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId, // Send key ID to frontend
      receipt: order.receipt,
      status: order.status,
      notes: order.notes,
    });
    
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    if (error instanceof Error) {
      return res.status(500).json({ 
        error: 'Failed to create checkout session',
        details: error.message 
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: 'Unknown error occurred'
    });
  }
};
