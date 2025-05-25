const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Whereby API proxy endpoint
app.post('/api/whereby/meetings', async (req, res) => {
  try {
    const body = req.body;
    const WHEREBY_API_KEY = process.env.VITE_WHEREBY_API_KEY;
    const WHEREBY_API_URL = process.env.VITE_WHEREBY_API_URL || 'https://api.whereby.dev/v1';

    if (!WHEREBY_API_KEY) {
      return res.status(500).json({ 
        error: 'Server misconfiguration: Missing Whereby API key' 
      });
    }

    console.log('Creating meeting with body:', JSON.stringify(body, null, 2));
    console.log('Using API key:', WHEREBY_API_KEY.substring(0, 5) + '...');

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
        error: data.message || 'Failed to create meeting' 
      });
    }

    console.log('Meeting created successfully:', JSON.stringify(data, null, 2));
    return res.json(data);
  } catch (error) {
    console.error('Error in create meeting API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// For development, proxy requests to Vite dev server
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // For all other requests, proxy to the Vite dev server
  res.redirect(`http://localhost:8080${req.path}`);
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`Whereby API proxy available at http://localhost:${PORT}/api/whereby/meetings`);
});
