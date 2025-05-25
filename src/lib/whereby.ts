import { toast } from 'react-hot-toast';

export interface Meeting {
  id: string;
  meetingId: string;
  roomUrl: string;
  hostRoomUrl: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  roomName?: string;
  hostRoom?: string;
  viewRecordingUrl?: string;
  isLocked?: boolean;
  roomMode?: string;
  roomModeProps?: Record<string, unknown>;
}

export interface CreateMeetingResponse {
  meetingId: string;
  roomUrl: string;
  hostRoomUrl: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  roomName: string;
  isLocked: boolean;
  roomMode: string;
  roomModeProps?: Record<string, unknown>;
}

export interface CreateMeetingOptions {
  roomNamePrefix?: string;
  roomMode?: 'normal' | 'group' | 'webinar';
  roomModeProps?: Record<string, unknown>;
  startDate?: Date | string;
  endDate: Date | string;
  fields?: string[];
  roomName?: string;
}

export async function createMeeting(options: CreateMeetingOptions): Promise<CreateMeetingResponse> {
  const {
    roomNamePrefix = 'meeting',
    roomMode = 'group',
    roomModeProps,
    startDate = new Date(),
    endDate = new Date(Date.now() + 3600000), // 1 hour from now
    fields = ['hostRoomUrl'],
  } = options;

  try {
    // Prepare the request body
    const body: Record<string, unknown> = {
      endDate: typeof endDate === 'string' ? endDate : endDate.toISOString(),
      fields,
      roomNamePrefix,
      roomMode,
    };

    // Add optional properties if provided
    if (roomModeProps) {
      body.roomModeProps = roomModeProps;
    }
    
    if (startDate) {
      body.startDate = typeof startDate === 'string' ? startDate : startDate.toISOString();
    }
    
    console.log('Creating meeting with body:', JSON.stringify(body, null, 2));
    
    const WHEREBY_API_KEY = import.meta.env.VITE_WHEREBY_API_KEY;
    const WHEREBY_API_URL = import.meta.env.VITE_WHEREBY_API_URL || 'https://api.whereby.dev/v1';
    
    if (!WHEREBY_API_KEY) {
      throw new Error('Missing Whereby API key');
    }
    
    const response = await fetch(`${WHEREBY_API_URL}/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHEREBY_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error creating meeting:', errorData);
      throw new Error(errorData.message || 'Failed to create meeting');
    }

    // Parse the response
    const responseData = await response.json();
    
    // Log the response for debugging
    console.log('Meeting created successfully:', responseData);
    
    // Return the response data with the current timestamp
    return {
      ...responseData,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to create meeting:', error);
    toast.error('Failed to create video meeting. Please try again.');
    throw error;
  }
}

// Export a function to get the Whereby API key (for server-side use only)
export function getWherebyApiKey(): string {
  if (typeof window !== 'undefined') {
    throw new Error('getWherebyApiKey should only be called on the server side');
  }
  return process.env.VITE_WHEREBY_API_KEY || '';
}
