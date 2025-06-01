'use client';

import { useEffect, useState } from 'react';
import { createMeeting } from '@/lib/whereby';

export default function TestWhereby() {
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createTestMeeting = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create a test meeting
      const now = new Date();
      const endDate = new Date(now.getTime() + 3600000); // 1 hour from now
      
      // Ensure we're providing all required fields
      const meetingOptions = {
        endDate: endDate,
        roomNamePrefix: 'test-meeting',
        roomMode: 'group' as const,
        fields: ['hostRoomUrl'],
        startDate: now, // Optional but good practice to include
      };
      
      console.log('Creating meeting with options:', meetingOptions);
      
      const meeting = await createMeeting(meetingOptions);
      
      setMeetingUrl(meeting.roomUrl);
      console.log('Meeting created:', meeting);
    } catch (err) {
      console.error('Failed to create meeting:', err);
      setError(err instanceof Error ? err.message : 'Failed to create meeting');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto mt-10 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Whereby Integration Test</h2>
      
      <button
        onClick={createTestMeeting}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Creating...' : 'Create Test Meeting'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      {meetingUrl && (
        <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
          <p className="font-medium">Meeting created successfully!</p>
          <a 
            href={meetingUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Open Meeting Room
          </a>
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-600">
        <p className="font-medium">API Key Status:</p>
        <code className="block mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
          {process.env.NEXT_PUBLIC_WHEREBY_API_KEY 
            ? '✅ API Key is configured' 
            : '❌ API Key is missing'}
        </code>
      </div>
    </div>
  );
}
