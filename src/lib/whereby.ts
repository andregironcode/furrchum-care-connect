import { toast } from 'sonner';

const WHEREBY_API_KEY = import.meta.env.VITE_WHEREBY_API_KEY;
const WHEREBY_API_URL = import.meta.env.VITE_WHEREBY_API_URL || 'https://api.whereby.dev/v1';

if (!WHEREBY_API_KEY) {
  console.error('Missing VITE_WHEREBY_API_KEY environment variable');
  toast.error('Video call service is not properly configured');
}

interface CreateMeetingOptions {
  startDate?: string; // ISO string
  endDate?: string;   // ISO string
  roomNamePrefix?: string;
  roomMode?: 'normal' | 'group';
  roomName?: string;
  hostRoomUrl?: string;
  viewRecordingUrl?: string;
  fields?: string[];
  isLocked?: boolean;
  roomModeProps?: {
    isAudioEnabled?: boolean;
    isVideoEnabled?: boolean;
    isChatEnabled?: boolean;
    isScreenShareEnabled?: boolean;
    isHandRaiseEnabled?: boolean;
    isRecorderEnabled?: boolean;
    isDefaultUserJoinHidden?: boolean;
    isScreenshareAutoOn?: boolean;
    isPeopleInCallHidden?: boolean;
    isVideoOnEntryEnabled?: boolean;
    isAudioOnEntryEnabled?: boolean;
    isReactionsEnabled?: boolean;
    isBreakoutRoomsEnabled?: boolean;
    isRecordingEnabled?: boolean;
    isWhiteboardEnabled?: boolean;
    isHandToolEnabled?: boolean;
    isLocked?: boolean;
    isRoomHidden?: boolean;
    isWatermarkEnabled?: boolean;
    isWaitingRoomEnabled?: boolean;
    isChatAvailable?: boolean;
    isPeopleInCallAvailable?: boolean;
    isReactionsAvailable?: boolean;
    isBreakoutRoomsAvailable?: boolean;
    isWhiteboardAvailable?: boolean;
    isHandToolAvailable?: boolean;
  };
}

export interface Meeting {
  meetingId: string;
  startDate: string;
  endDate: string;
  roomUrl: string;
  hostRoomUrl: string;
  viewRecordingUrl?: string;
  roomName: string;
  hostRoom?: boolean;
  isLocked: boolean;
  roomMode: 'normal' | 'group';
  roomModeProps: {
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    isChatEnabled: boolean;
    isScreenShareEnabled: boolean;
    isHandRaiseEnabled: boolean;
    isRecorderEnabled: boolean;
    isDefaultUserJoinHidden: boolean;
    isScreenshareAutoOn: boolean;
    isPeopleInCallHidden: boolean;
    isVideoOnEntryEnabled: boolean;
    isAudioOnEntryEnabled: boolean;
    isReactionsEnabled: boolean;
    isBreakoutRoomsEnabled: boolean;
    isRecordingEnabled: boolean;
    isWhiteboardEnabled: boolean;
    isHandToolEnabled: boolean;
    isLocked: boolean;
    isRoomHidden: boolean;
    isWatermarkEnabled: boolean;
    isWaitingRoomEnabled: boolean;
    isChatAvailable: boolean;
    isPeopleInCallAvailable: boolean;
    isReactionsAvailable: boolean;
    isBreakoutRoomsAvailable: boolean;
    isWhiteboardAvailable: boolean;
    isHandToolAvailable: boolean;
  };
}

// Environment variable validation
if (!WHEREBY_API_KEY) {
  console.error('Missing VITE_WHEREBY_API_KEY environment variable');
  toast.error('Video call service is not properly configured');
  throw new Error('Video call service is not properly configured');
}

export async function createMeeting(options: CreateMeetingOptions = {}): Promise<Meeting> {
  if (!options.endDate) {
    throw new Error('endDate is required for creating a meeting');
  }

  const meetingEndDate = new Date(options.endDate);
  const now = new Date();
  
  // Ensure the meeting end date is in the future
  if (meetingEndDate <= now) {
    throw new Error('Meeting end date must be in the future');
  }
  
  // Validate meeting duration (max 2 hours per meeting)
  const meetingDuration = meetingEndDate.getTime() - new Date(options.startDate || now).getTime();
  const maxDuration = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  if (meetingDuration > maxDuration) {
    throw new Error('Meeting duration cannot exceed 2 hours');
  }
  
  // Ensure we have the API key configured
  if (!WHEREBY_API_KEY) {
    console.error('Missing Whereby API key configuration');
    throw new Error('Video service is not properly configured. Please contact support.');
  }
  
  // Log the meeting creation attempt
  console.log('Creating Whereby meeting with options:', {
    startDate: options.startDate || 'now',
    endDate: options.endDate,
    roomNamePrefix: options.roomNamePrefix || 'FurrChum',
    isLocked: options.isLocked || false
  });

  const body = {
    endDate: meetingEndDate.toISOString(),
    roomNamePrefix: (options.roomNamePrefix || 'furrchum-').substring(0, 30), // Ensure it's not too long
    roomMode: options.roomMode || 'normal',
    fields: options.fields || ['hostRoomUrl', 'viewerRoomUrl'],
    isLocked: options.isLocked ?? true, // Locked by default for security
    roomModeProps: {
      isAudioEnabled: true,
      isVideoEnabled: true,
      isChatEnabled: true,
      isScreenShareEnabled: true,
      isHandRaiseEnabled: true,
      isRecorderEnabled: false,
      isDefaultUserJoinHidden: false,
      isScreenshareAutoOn: false,
      isPeopleInCallHidden: false,
      isVideoOnEntryEnabled: true,
      isAudioOnEntryEnabled: true,
      isReactionsEnabled: true,
      isBreakoutRoomsEnabled: false,
      isRecordingEnabled: false,
      isWhiteboardEnabled: true,
      isHandToolEnabled: true,
      isLocked: false,
      isRoomHidden: false,
      isWatermarkEnabled: true,
      isWaitingRoomEnabled: true,
      isChatAvailable: true,
      isPeopleInCallAvailable: true,
      isReactionsAvailable: true,
      isBreakoutRoomsAvailable: false,
      isWhiteboardAvailable: true,
      isHandToolAvailable: true,
      ...(options.roomModeProps || {})
    },
    ...(options.roomName && { roomName: options.roomName }),
    ...(options.startDate && { startDate: options.startDate }),
  };

  try {
    console.log('Sending meeting creation request to API...');
    
    const response = await fetch('/api/whereby/meetings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // The Authorization header is now handled by the proxy
      },
      body: JSON.stringify(body),
    });

    // Parse the response
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      console.error('Failed to parse response:', e);
      throw new Error('Received an invalid response from the video service.');
    }

    // Handle non-OK responses
    if (!response.ok) {
      console.error('Video API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
        requestBody: body
      });
      
      // Provide user-friendly error messages based on status code
      if (response.status === 401) {
        throw new Error('Authentication with video service failed. Please contact support.');
      } else if (response.status === 400) {
        throw new Error('Invalid meeting parameters. Please try again.');
      } else if (response.status >= 500) {
        throw new Error('Video service is currently unavailable. Please try again later.');
      }
      
      // Default error message
      throw new Error(responseData.message || 'Failed to create video meeting. Please try again.');
    }
    
    // Log successful meeting creation
    console.log('Successfully created meeting:', {
      meetingId: responseData.meetingId,
      roomUrl: responseData.roomUrl
    });

    return responseData;
  } catch (error) {
    console.error('Error creating meeting:', error);
    toast.error('Failed to create video meeting. Please try again.');
    throw error;
  }
}

export async function getMeeting(meetingId: string): Promise<Meeting> {
  try {
    const response = await fetch(`${WHEREBY_API_URL}/meetings/${meetingId}`, {
      headers: {
        'Authorization': `Bearer ${WHEREBY_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch meeting');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching meeting:', error);
    toast.error('Failed to fetch meeting details');
    throw error;
  }
}

export async function deleteMeeting(meetingId: string): Promise<void> {
  try {
    const response = await fetch(`${WHEREBY_API_URL}/meetings/${meetingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${WHEREBY_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete meeting');
    }
  } catch (error) {
    console.error('Error deleting meeting:', error);
    toast.error('Failed to delete meeting');
    throw error;
  }
}
