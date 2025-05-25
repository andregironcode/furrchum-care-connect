const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:8080'],
  credentials: true
}));
app.use(bodyParser.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Whereby API proxy endpoint
app.post('/api/whereby/meetings', async (req, res) => {
  try {
    const body = req.body;
    const WHEREBY_API_KEY = process.env.VITE_WHEREBY_API_KEY;
    const WHEREBY_API_URL = process.env.VITE_WHEREBY_API_URL || 'https://api.whereby.dev/v1';

    if (!WHEREBY_API_KEY) {
      console.error('Missing Whereby API key in environment variables');
      return res.status(500).json({ 
        error: 'Server misconfiguration: Missing Whereby API key' 
      });
    }

    console.log('Creating Whereby meeting with request body:', JSON.stringify(body, null, 2));

    const response = await fetch(`${WHEREBY_API_URL}/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHEREBY_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Whereby API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: data
      });
      
      return res.status(response.status).json({ 
        error: data.error || data.message || 'Failed to create meeting' 
      });
    }

    // Validate expected fields in response
    if (!data.meetingId || !data.roomUrl) {
      console.error('Invalid response from Whereby API:', data);
      return res.status(502).json({
        error: 'Invalid response from Whereby API: Missing required fields'
      });
    }

    console.log('Meeting created successfully:', JSON.stringify(data, null, 2));
    return res.json(data);
  } catch (error) {
    console.error('Error in create meeting API:', error);
    return res.status(500).json({ error: 'Internal server error: ' + (error.message || 'Unknown error') });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    const WHEREBY_API_KEY = process.env.VITE_WHEREBY_API_KEY;
    const WHEREBY_API_URL = process.env.VITE_WHEREBY_API_URL || 'https://api.whereby.dev/v1';
    
    if (!WHEREBY_API_KEY) {
      return res.status(500).json({ 
        status: 'error',
        message: 'Whereby API key is missing',
        configured: false
      });
    }
    
    return res.json({ 
      status: 'ok',
      serverTime: new Date().toISOString(),
      configured: true,
      api: {
        name: 'Whereby',
        url: WHEREBY_API_URL
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
});

// For development, proxy requests to Vite dev server
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // For all other requests, proxy to the Vite dev server
  // Use a dynamic port based on environment variable or default to 8081
  const VITE_PORT = process.env.VITE_PORT || 8081;
  res.redirect(`http://localhost:${VITE_PORT}${req.path}`);
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`Whereby API proxy available at http://localhost:${PORT}/api/whereby/meetings`);
});
