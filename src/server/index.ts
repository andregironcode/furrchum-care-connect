import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import wherebyRouter from './whereby';
import { createCheckoutSession } from './api/create-checkout-session';
import { stripeWebhook } from './api/webhook';

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Stripe webhook needs raw body for signature verification
app.use('/api/webhook', express.raw({ type: 'application/json' }));

// Routes
app.use('/api/whereby', wherebyRouter);

// Stripe payment routes
app.post('/api/create-checkout-session', createCheckoutSession);
app.post('/api/webhook', stripeWebhook);

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
