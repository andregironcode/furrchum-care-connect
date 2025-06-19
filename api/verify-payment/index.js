// Vercel serverless function for verifying Razorpay payments

const crypto = require('crypto');

module.exports = async (req, res) => {
  try {
    console.log('Payment verification called');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
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
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !booking_id) {
      console.error('Missing required payment verification data');
      return res.status(400).json({ error: 'Missing required payment verification data' });
    }
    
    // Get Razorpay configuration
    const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET;
    
    if (!keySecret) {
      console.error('Razorpay key secret not configured');
      return res.status(500).json({ error: 'Payment verification not configured' });
    }
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    
    if (expectedSignature !== razorpay_signature) {
      console.error('Payment signature verification failed');
      console.error('Expected:', expectedSignature);
      console.error('Received:', razorpay_signature);
      return res.status(400).json({ error: 'Payment verification failed' });
    }
    
    console.log('Payment signature verified successfully');
    
    // Update transaction status to completed in Supabase
    let transactionId = null;
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        console.log('Looking for pending transaction with order ID:', razorpay_order_id);
        
        // Find and update the pending transaction with this order ID
        const { data: existingTransaction, error: findError } = await supabase
          .from('transactions')
          .select('*')
          .eq('provider_order_id', razorpay_order_id)
          .eq('status', 'pending')
          .single();
        
        if (!findError && existingTransaction) {
          console.log('Found pending transaction, updating to completed:', existingTransaction.id);
          
          const { data: updatedTransaction, error: updateError } = await supabase
            .from('transactions')
            .update({
              status: 'completed',
              provider_payment_id: razorpay_payment_id,
              transaction_reference: razorpay_payment_id,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingTransaction.id)
            .select('*')
            .single();
          
          if (updateError) {
            console.error('Error updating transaction status:', updateError);
          } else {
            console.log('Transaction status updated to completed:', updatedTransaction);
            transactionId = updatedTransaction.id;
          }
        } else {
          console.error('No pending transaction found for order ID:', razorpay_order_id);
          if (findError) {
            console.error('Find error:', findError);
          }
        }
      } else {
        console.error('Missing Supabase configuration for transaction update');
      }
    } catch (updateError) {
      console.error('Exception in transaction update process:', updateError);
    }
    
    // Check if booking_id is a temporary ID (starts with "temp_")
    if (booking_id.startsWith('temp_')) {
      console.log('Temporary booking ID detected, payment verified for frontend handling');
      // For temporary booking IDs, just return success
      // The frontend will handle creating the actual booking
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        booking_id: booking_id,
        transaction_id: transactionId,
        isTemporaryBooking: true
      });
    }
    
    // If it's a real booking ID, update the existing booking
    // (This would be for any legacy flow or admin operations)
    console.log('Real booking ID detected, would update existing booking');
    
    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      booking_id: booking_id,
      transaction_id: transactionId,
      isTemporaryBooking: false
    });
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({ 
      error: 'Failed to verify payment',
      details: error.message || 'Unknown error occurred'
    });
  }
}; 