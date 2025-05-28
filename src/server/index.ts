import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import wherebyRouter from './whereby';
import { createCheckoutSession } from './api/create-checkout-session';
import { razorpayWebhook } from './api/webhook';
import { verifyPayment } from './api/verify-payment';
import { sendWelcomeEmail } from './api/send-welcome-email';

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Configure CORS for security
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.VITE_APP_URL || '', /\.vercel\.app$/]
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Security headers
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  if (process.env.NODE_ENV === 'production') {
    // Strict Transport Security
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
});

// Razorpay webhook needs raw body for signature verification
app.use('/api/webhook', express.raw({ type: 'application/json' }));

// Routes
app.use('/api/whereby', wherebyRouter);

// Email routes
app.post('/api/send-welcome-email', sendWelcomeEmail);

// Razorpay payment routes
app.post('/api/create-checkout-session', createCheckoutSession);
app.post('/api/webhook', razorpayWebhook);
app.post('/api/verify-payment', verifyPayment);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start the server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
}

export default app;
