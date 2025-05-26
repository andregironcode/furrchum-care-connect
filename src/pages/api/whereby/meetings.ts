import type { NextApiRequest, NextApiResponse } from 'next';

const WHEREBY_API_URL = process.env.WHEREBY_API_URL || process.env.VITE_WHEREBY_API_URL || 'https://api.whereby.dev/v1';
// Try both with and without VITE_ prefix to support both local and Vercel environments
const API_KEY = process.env.WHEREBY_API_KEY || process.env.VITE_WHEREBY_API_KEY;

// Helper function to set CORS headers
type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

const allowCors = (fn: ApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  return await fn(req, res);
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['POST'] 
    });
  }

  if (!API_KEY) {
    console.error('Missing Whereby API key');
    return res.status(500).json({ 
      error: 'Server configuration error',
      details: 'Whereby API key is not configured'
    });
  }

  try {
    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ 
        error: 'Invalid request body',
        details: 'Request body must be a valid JSON object'
      });
    }

    const response = await fetch(`${WHEREBY_API_URL}/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Whereby API error:', {
        status: response.status,
        statusText: response.statusText,
        error: data,
        requestBody: req.body
      });
      
      return res.status(response.status).json({ 
        error: 'Failed to create meeting',
        details: data,
        status: response.status
      });
    }

    // Log successful creation (without sensitive data)
    console.log('Successfully created meeting:', {
      meetingId: data.meetingId,
      roomName: data.roomName,
      roomUrl: data.roomUrl ? '***' : undefined
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error creating Whereby meeting:', error);
    return res.status(500).json({ 
      error: 'Failed to create meeting',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    });
  }
};

export default allowCors(handler);
