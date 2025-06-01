import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Enable CORS
router.use(cors());

// Create a meeting in Whereby
router.post('/meetings', async (req, res) => {
  try {
    const body = req.body;
    const WHEREBY_API_KEY = process.env.VITE_WHEREBY_API_KEY;
    const WHEREBY_API_URL = process.env.VITE_WHEREBY_API_URL || 'https://api.whereby.dev/v1';

    if (!WHEREBY_API_KEY) {
      return res.status(500).json({ 
        error: 'Server misconfiguration: Missing Whereby API key' 
      });
    }

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

    return res.json(data);
  } catch (error) {
    console.error('Error in create meeting API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a meeting in Whereby
router.delete('/meetings/:meetingId', async (req, res) => {
  try {
    const { meetingId } = req.params;
    const WHEREBY_API_KEY = process.env.VITE_WHEREBY_API_KEY;
    const WHEREBY_API_URL = process.env.VITE_WHEREBY_API_URL || 'https://api.whereby.dev/v1';

    if (!WHEREBY_API_KEY) {
      return res.status(500).json({ 
        error: 'Server misconfiguration: Missing Whereby API key' 
      });
    }

    if (!meetingId) {
      return res.status(400).json({ error: 'Meeting ID is required' });
    }

    // Whereby API doesn't actually have a delete endpoint, but we'll make this future-proof
    // in case they add one. For now, we'll just return success.
    // If Whereby adds a DELETE endpoint in the future, uncomment the code below:
    /*
    const response = await fetch(`${WHEREBY_API_URL}/meetings/${meetingId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHEREBY_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error('Whereby API Error:', {
        status: response.status,
        statusText: response.statusText,
      });
      
      return res.status(response.status).json({ 
        error: 'Failed to delete meeting' 
      });
    }
    */

    // For now, just log the attempt and return success
    console.log(`Attempted to delete meeting ${meetingId} - NOTE: Whereby API currently does not support meeting deletion`);
    
    return res.status(200).json({ 
      success: true,
      message: 'Meeting cleanup requested'
    });
  } catch (error) {
    console.error('Error in delete meeting API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
