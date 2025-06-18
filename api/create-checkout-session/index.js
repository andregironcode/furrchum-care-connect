// Vercel serverless function for creating Razorpay checkout sessions

module.exports = async (req, res) => {
  try {
    console.log('Create checkout session called');
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed, use POST' });
    }

    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { bookingData } = req.body;
    
    if (!bookingData) {
      console.error('Missing bookingData in request');
      return res.status(400).json({ error: 'Booking data is required' });
    }
    
    console.log('Booking data received:', JSON.stringify(bookingData, null, 2));
    
    // Get Razorpay configuration
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET;
    
    // Debug logging (safely)
    console.log('Razorpay Key ID:', keyId ? `${keyId.substring(0, 8)}...` : 'NOT SET');
    console.log('Razorpay Key Secret:', keySecret ? `${keySecret.substring(0, 8)}...` : 'NOT SET');
    
    if (!keyId || !keySecret) {
      console.error('Razorpay credentials not configured');
      return res.status(500).json({ error: 'Payment system not configured' });
    }
    
    // Initialize Razorpay
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    
    // Calculate amounts (in paise for Razorpay)
    const consultationFee = bookingData.fee || 500;
    const serviceFee = 121; // Fixed service fee of ₹121 (already included in fee)
    const totalAmount = consultationFee; // Fee already includes service fee
    const amountInPaise = totalAmount * 100; // Convert to paise
    
    console.log('Fee calculation:', {
      consultationFee,
      serviceFee,
      totalAmount,
      amountInPaise
    });
    
    // Create Razorpay order with shorter receipt
    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `bk_${bookingData.bookingId.split('-')[0]}_${Date.now().toString().slice(-6)}`, // Keep under 40 chars
      notes: {
        booking_id: bookingData.bookingId,
        vet_id: bookingData.vetId,
        pet_id: bookingData.petId,
        consultation_type: bookingData.consultationType,
        user_id: bookingData.userId,
      },
    };
    
    console.log('Creating Razorpay order with options:', JSON.stringify(orderOptions, null, 2));
    
    const order = await razorpay.orders.create(orderOptions);
    
    console.log('Razorpay order created successfully:', JSON.stringify(order, null, 2));
    
    // Return the order details
    const responseData = {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId, // Send key ID to frontend
      receipt: order.receipt,
      status: order.status,
      notes: order.notes,
    };
    
    console.log('Sending response:', JSON.stringify(responseData, null, 2));
    return res.status(200).json(responseData);
    
  } catch (error) {
    console.error('Error in create-checkout-session:', error);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message || 'Unknown error occurred'
    });
  }
}; 