import { toast } from 'sonner';

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
  roomMode?: 'normal' | 'group';
  roomModeProps?: {
    isWaitingRoomEnabled?: boolean;
    isLocked?: boolean;
    isRecordingEnabled?: boolean;
    isAudioEnabled?: boolean;
    isVideoEnabled?: boolean;
    isChatEnabled?: boolean;
    isScreenSharingEnabled?: boolean;
    isHandRaiseEnabled?: boolean;
  };
  startDate?: Date | string;
  endDate: Date | string;
  fields?: string[];
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
    // Ensure roomNamePrefix is not too long - Whereby API has a limit
    // Truncate to a maximum of 16 characters to be safe
    const truncatedRoomPrefix = roomNamePrefix.length > 16 
      ? roomNamePrefix.substring(0, 16) 
      : roomNamePrefix;
    
    const body: Record<string, unknown> = {
      endDate: typeof endDate === 'string' ? endDate : endDate.toISOString(),
      fields,
      roomNamePrefix: truncatedRoomPrefix,
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
    
    // Use a proxy endpoint to avoid CORS issues and keep API key secure
    const response = await fetch('/api/whereby/meetings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create meeting';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        console.error('Error creating meeting:', errorData);
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    // Parse the response
    const responseData = await response.json();
    
    // Log the response for debugging
    console.log('Meeting created successfully:', responseData);

    // Validate the response data
    if (!responseData.meetingId || !responseData.roomUrl) {
      throw new Error('Invalid response from Whereby API: Missing required fields');
    }

    // Map the response to our CreateMeetingResponse interface
    const meeting: CreateMeetingResponse = {
      meetingId: responseData.meetingId,
      startDate: responseData.startDate,
      endDate: responseData.endDate,
      roomUrl: responseData.roomUrl,
      hostRoomUrl: responseData.hostRoomUrl || '',
      roomName: responseData.roomName || '',
      isLocked: responseData.isLocked || false,
      roomMode: responseData.roomMode || 'group',
      roomModeProps: responseData.roomModeProps,
      createdAt: new Date().toISOString(),
    };

    return meeting;
  } catch (error) {
    console.error('Failed to create meeting:', error);
    toast.error('Failed to create video meeting. Please try again.');
    throw error;
  }
}

/**
 * Deletes a Whereby meeting by its ID
 * @param meetingId The ID of the meeting to delete
 * @returns A promise that resolves when the meeting is deleted
 */
export async function deleteMeeting(meetingId: string): Promise<boolean> {
  try {
    // Use a proxy endpoint to avoid CORS issues and keep API key secure
    const response = await fetch(`/api/whereby/meetings/${meetingId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to delete meeting';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        console.error('Error deleting meeting:', errorData);
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    // Meeting was successfully deleted
    console.log(`Meeting ${meetingId} was successfully deleted`);
    return true;
  } catch (error) {
    console.error(`Failed to delete meeting ${meetingId}:`, error);
    // Don't show an error toast to the user as this happens in the background
    // and should not interrupt their flow
    return false;
  }
}

// Export a function to get the Whereby API key (for server-side use only)
export function getWherebyApiKey(): string {
  if (typeof window !== 'undefined') {
    throw new Error('getWherebyApiKey should only be called on the server side');
  }
  return process.env.VITE_WHEREBY_API_KEY || '';
}
