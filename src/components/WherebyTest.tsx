import { useState } from 'react';
import { createMeeting } from '@/lib/whereby';

export default function WherebyTest() {
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
      
      const meeting = await createMeeting({
        endDate: endDate.toISOString(),
        roomNamePrefix: 'test-meeting',
        roomMode: 'group' as const,
        fields: ['hostRoomUrl'],
        startDate: now.toISOString(),
      });
      
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
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Whereby Integration Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-4">
            <button
              onClick={createTestMeeting}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Creating Meeting...' : 'Create Test Meeting'}
            </button>

            {meetingUrl && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                <p className="font-medium text-green-800">Meeting created successfully!</p>
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

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="font-medium text-red-800">Error: {error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Testing Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Click the "Create Test Meeting" button</li>
            <li>Wait for the meeting to be created (this may take a few seconds)</li>
            <li>Once created, click the "Open Meeting Room" link to join the meeting</li>
            <li>Verify that you can see the video call interface</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
