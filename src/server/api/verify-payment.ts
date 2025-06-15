import { Request, Response } from 'express';
import { razorpayInstance, createHmac, verifyRazorpaySignature } from '../api-middleware';
import { supabase } from '../../integrations/supabase/server';

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = req.body;

    // Verify the payment signature
    const generatedSignature = createHmac(
      'sha256',
      process.env.VITE_RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || ''
    )
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Verify signature
    if (generatedSignature !== razorpay_signature) {
      console.error('Invalid signature', {
        generatedSignature,
        receivedSignature: razorpay_signature,
      });
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Fetch payment details from Razorpay
    const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);

    // Verify payment status
    if (payment.status !== 'captured') {
      console.error('Payment not captured', { payment });
      return res.status(400).json({ error: 'Payment not captured' });
    }

    // Update booking status in database
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        payment_id: razorpay_payment_id,
        payment_provider: 'razorpay',
        payment_data: {
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id,
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
          status: payment.status,
          created_at: new Date().toISOString(),
        },
        razorpay_payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking_id);

    if (updateError) {
      console.error('Failed to update booking status', updateError);
      return res.status(500).json({ error: 'Failed to update booking status' });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        booking_id,
        payment_id: razorpay_payment_id,
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ error: 'Payment verification failed' });
  }
};
