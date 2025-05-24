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

export async function createMeeting(options: CreateMeetingOptions = {}): Promise<Meeting> {
  if (!options.endDate) {
    throw new Error('endDate is required for creating a meeting');
  }

  // Ensure the meeting end date is in the future
  const meetingEndDate = new Date(options.endDate);
  if (meetingEndDate <= new Date()) {
    throw new Error('Meeting end date must be in the future');
  }

  // Set maximum meeting duration (24 hours)
  const maxDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  if ((meetingEndDate.getTime() - Date.now()) > maxDuration) {
    throw new Error('Meeting duration cannot exceed 24 hours');
  }

  const body = {
    endDate: meetingEndDate.toISOString(),
    roomNamePrefix: options.roomNamePrefix || 'furrchum-',
    roomMode: options.roomMode || 'normal',
    fields: options.fields || ['hostRoomUrl', 'viewRecordingUrl'],
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
      isWaitingRoomEnabled: false,
      isChatAvailable: true,
      isPeopleInCallAvailable: true,
      isReactionsAvailable: true,
      isBreakoutRoomsAvailable: false,
      isWhiteboardAvailable: true,
      isHandToolAvailable: true,
      ...options.roomModeProps,
    },
    ...(options.roomName && { roomName: options.roomName }),
    ...(options.startDate && { startDate: options.startDate }),
  };

  try {
    const response = await fetch(`${WHEREBY_API_URL}/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHEREBY_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create meeting');
    }

    return await response.json();
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
