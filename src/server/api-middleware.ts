// Simple Express-like middleware for Vite API routes
import type { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Initialize Stripe with the secret key
export const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16', // Use the latest API version
});

// Initialize Supabase admin client for server operations
export const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''
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

// Helper for raw body parsing (for Stripe webhooks)
export const getRawBody = async (req: Request): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    req.on('data', (chunk) => {
      chunks.push(Buffer.from(chunk));
    });
    
    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    
    req.on('error', reject);
  });
};
