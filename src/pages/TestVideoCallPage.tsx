import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Video as VideoIcon } from 'lucide-react';
import { createMeeting } from '@/lib/whereby';

const TestVideoCallPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);
  const [hostMeetingUrl, setHostMeetingUrl] = useState<string | null>(null);
  const [meetingId, setMeetingId] = useState<string | null>(null);

  const createTestMeeting = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    try {
      // Create a meeting starting now, lasting 60 minutes
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour from now
      
      const meeting = await createMeeting({
        roomNamePrefix: 'test-meeting',
        roomMode: 'group',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        fields: ['hostRoomUrl'],
        roomModeProps: {
          isWaitingRoomEnabled: true,
          isLocked: false,
          isRecordingEnabled: false,
          isAudioEnabled: true,
          isVideoEnabled: true,
          isChatEnabled: true,
          isScreenSharingEnabled: true,
          isHandRaiseEnabled: true
        }
      });
      
      // Store meeting details
      setMeetingUrl(meeting.roomUrl);
      setHostMeetingUrl(meeting.hostRoomUrl || null);
      setMeetingId(meeting.meetingId);
      
      toast.success('Test meeting created successfully!');
    } catch (error) {
      console.error('Error creating test meeting:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to create test meeting. Please try again.'
      );
    } finally {
      setIsCreating(false);
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Video Call Testing</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create Test Meeting</CardTitle>
          <CardDescription>
            Create a test video call to verify the Whereby integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {!meetingUrl ? (
              <Button 
                onClick={createTestMeeting} 
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Meeting...
                  </>
                ) : (
                  <>
                    <VideoIcon className="mr-2 h-4 w-4" />
                    Create Test Meeting
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <VideoIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Meeting Created</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>Meeting ID: {meetingId}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-4">
                  <Button onClick={() => openInNewTab(meetingUrl)} variant="default">
                    <VideoIcon className="mr-2 h-4 w-4" />
                    Join as Participant (Pet Owner)
                  </Button>
                  
                  {hostMeetingUrl && (
                    <Button onClick={() => openInNewTab(hostMeetingUrl)} variant="outline">
                      <VideoIcon className="mr-2 h-4 w-4" />
                      Join as Host (Veterinarian)
                    </Button>
                  )}
                  
                  <Button onClick={createTestMeeting} variant="secondary" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating New Meeting...
                      </>
                    ) : (
                      'Create Another Meeting'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">How to Test:</h3>
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                <li>Click "Create Test Meeting" to generate a new Whereby meeting</li>
                <li>Open both links in separate browser windows or devices</li>
                <li>As a host (vet), you'll have additional controls</li>
                <li>As a participant (pet owner), you'll join the same room</li>
                <li>Test audio, video, screen sharing, and other features</li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Features to Test:</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Video and audio quality</li>
                <li>Screen sharing functionality</li>
                <li>Chat features</li>
                <li>Host controls (if applicable)</li>
                <li>Connection stability</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestVideoCallPage;
