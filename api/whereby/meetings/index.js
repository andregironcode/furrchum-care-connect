// Vercel serverless function for Whereby API

// Using ES module syntax as required by Vercel configuration
export default async (req, res) => {
  try {
    // Import fetch dynamically to avoid issues with older Node.js versions in Vercel
    const fetch = await import('node-fetch').then(mod => mod.default);
    
    // Enable better debugging
    console.log('API endpoint hit:', req.method);
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Method not allowed, use POST' 
      });
    }

    const body = req.body;
    // Log available environment variables to help debug (redacted for security)
    console.log('Available env vars:', Object.keys(process.env));
    
    // In Vercel serverless functions, environment variables might not retain the VITE_ prefix
    // Try both with and without the prefix
    const WHEREBY_API_KEY = process.env.WHEREBY_API_KEY || process.env.VITE_WHEREBY_API_KEY;
    
    // Explicitly set the API URL to avoid any potential formatting issues
    // Remove any markdown formatting that might be in the environment variable
    let rawApiUrl = process.env.WHEREBY_API_URL || process.env.VITE_WHEREBY_API_URL || 'https://api.whereby.dev/v1';
    // Clean up the URL by removing any markdown link formatting if present
    const cleanApiUrl = rawApiUrl.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    const WHEREBY_API_URL = cleanApiUrl;
    
    // Log API configuration (partially redacted for security)
    console.log('API URL:', WHEREBY_API_URL);
    console.log('API Key available:', !!WHEREBY_API_KEY);

    if (!WHEREBY_API_KEY) {
      return res.status(500).json({ 
        error: 'Server misconfiguration: Missing Whereby API key' 
      });
    }

    // Log request body
    console.log('Creating meeting with body:', JSON.stringify(body, null, 2));

    // Make sure the roomNamePrefix is not too long (Whereby limitation)
    if (body.roomNamePrefix && body.roomNamePrefix.length > 16) {
      body.roomNamePrefix = body.roomNamePrefix.substring(0, 16);
    }

    // Log the request we're about to make (redact sensitive info)
    console.log(`Making request to ${WHEREBY_API_URL}/meetings with body:`, JSON.stringify(body));
    
    // Log and ensure the URL is properly formatted
    const apiEndpoint = 'https://api.whereby.dev/v1/meetings';
    console.log('Making request to:', apiEndpoint);
    
    // Call Whereby API to create meeting - using hardcoded URL to avoid any formatting issues
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHEREBY_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    
    // Debug the raw response
    console.log('Response status:', response.status);
    console.log('Response headers:', JSON.stringify([...response.headers.entries()]));
    
    // Get response text first to debug any parsing issues
    const responseText = await response.text();
    console.log('Response text:', responseText.substring(0, 200) + '...');
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      return res.status(502).json({
        error: 'Invalid JSON response from Whereby API',
        responseText: responseText.substring(0, 100) + '...' // Include first part of response for debugging
      });
    }

    // Handle error responses from Whereby API
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

    // Return successful response
    console.log('Meeting created successfully:', JSON.stringify(data, null, 2));
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in create meeting API:', error);
    return res.status(500).json({ 
      error: 'Internal server error: ' + (error.message || 'Unknown error') 
    });
  }
};
