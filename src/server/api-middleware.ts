// Simple Express-like middleware for Vite API routes
import type { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import rawBody from 'raw-body';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay with key and secret
export const razorpayInstance = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID || '',
  key_secret: process.env.VITE_RAZORPAY_KEY_SECRET || '',
});

// Initialize Supabase admin client for server operations
export const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''
);

// Helper for parsing request body
export const parseBody = async (req: Request) => {
  try {
    return req.body;
  } catch (error) {
    console.error('Error parsing request body:', error);
    return null;
  }
};

// Helper to get raw body for signature verification
export const getRawBody = async (req: Request): Promise<Buffer> => {
  if (req.body instanceof Buffer) {
    return req.body;
  }
  return rawBody(req);
};

// Helper to create HMAC
export const createHmac = crypto.createHmac;

// Helper function to verify Razorpay webhook signatures
export function verifyRazorpayWebhook(rawBody: string, signature: string) {
  const webhookSecret = process.env.VITE_RAZORPAY_WEBHOOK_SECRET || '';
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === signature;
}

// Helper function to verify Razorpay payment signatures
export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const secretKey = process.env.VITE_RAZORPAY_KEY_SECRET || '';
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expectedSignature === signature;
}
