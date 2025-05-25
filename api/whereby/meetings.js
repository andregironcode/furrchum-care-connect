// Vercel API endpoint for Whereby meetings
const fetch = require('node-fetch');

/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
module.exports = async (req, res) => {
  // Set CORS headers to allow cross-origin requests
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed, use POST' });
  }

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

    // Validate expected fields in response
    if (!data.meetingId || !data.roomUrl) {
      console.error('Invalid response from Whereby API:', data);
      return res.status(502).json({
        error: 'Invalid response from Whereby API: Missing required fields'
      });
    }

    console.log('Meeting created successfully:', JSON.stringify(data, null, 2));
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in create meeting API:', error);
    return res.status(500).json({ error: 'Internal server error: ' + (error.message || 'Unknown error') });
  }
}
