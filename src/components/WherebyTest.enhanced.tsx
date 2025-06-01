import { useState, useEffect } from 'react';
import { createMeeting } from '@/lib/whereby';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

export default function WherebyTest() {
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);
  const [hostMeetingUrl, setHostMeetingUrl] = useState<string | null>(null);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<Array<{type: 'info' | 'error' | 'success', message: string}>>([]);

  const addLog = (type: 'info' | 'error' | 'success', message: string) => {
    setLogs(prev => [...prev, { type, message }]);
  };

  const checkApiHealth = async () => {
    try {
      addLog('info', 'Checking API health...');
      const response = await fetch('/api/health');
      
      if (!response.ok) {
        throw new Error(`API health check failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      addLog('success', `API health check successful: ${JSON.stringify(data)}`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', `API health check failed: ${message}`);
      return false;
    }
  };

  const createTestMeeting = async () => {
    try {
      setLogs([]);
      setIsLoading(true);
      setError(null);
      setTestStatus('idle');
      
      // First check API health
      const isHealthy = await checkApiHealth();
      if (!isHealthy) {
        addLog('error', 'Skipping meeting creation due to API health check failure');
        throw new Error('API server is not responding. Please ensure the server is running.');
      }
      
      // Create a test meeting
      const now = new Date();
      const endDate = new Date(now.getTime() + 3600000); // 1 hour from now
      
      addLog('info', `Creating meeting from ${now.toISOString()} to ${endDate.toISOString()}`);
      
      const meeting = await createMeeting({
        endDate: endDate.toISOString(),
        roomNamePrefix: 'test-meeting',
        roomMode: 'group',
        fields: ['hostRoomUrl'],
        startDate: now.toISOString(),
        roomModeProps: {
          isLocked: false,
          isAudioEnabled: true,
          isVideoEnabled: true,
          isChatEnabled: true,
          isScreenSharingEnabled: true
        }
      });
      
      setMeetingUrl(meeting.roomUrl);
      setHostMeetingUrl(meeting.hostRoomUrl);
      setMeetingId(meeting.meetingId);
      
      addLog('success', `Meeting created with ID: ${meeting.meetingId}`);
      addLog('success', `Room URL: ${meeting.roomUrl}`);
      addLog('success', `Host Room URL: ${meeting.hostRoomUrl || 'Not available'}`);
      
      setTestStatus('success');
    } catch (err) {
      console.error('Failed to create meeting:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create meeting';
      setError(errorMessage);
      addLog('error', `Error: ${errorMessage}`);
      setTestStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Whereby Integration Test</h1>
        <p className="text-gray-600 mb-8">Test your Whereby video call integration</p>
        
        <Tabs defaultValue="test" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="test">Test Tool</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="help">Help</TabsTrigger>
          </TabsList>
          
          <TabsContent value="test">
            <Card>
              <CardHeader>
                <CardTitle>Create Test Meeting</CardTitle>
                <CardDescription>
                  Test your Whereby integration by creating a temporary meeting
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <Button
                    onClick={createTestMeeting}
                    disabled={isLoading}
                    className="w-full md:w-auto"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? 'Creating Meeting...' : 'Create Test Meeting'}
                  </Button>

                  {testStatus === 'success' && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <p className="font-medium text-green-800">Meeting created successfully!</p>
                      </div>
                      
                      <div className="mt-4 space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Meeting ID</p>
                          <p className="font-mono text-sm">{meetingId}</p>
                        </div>
                        
                        {meetingUrl && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Participant URL</p>
                            <div className="flex items-center">
                              <a 
                                href={meetingUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-mono text-sm truncate max-w-md"
                              >
                                {meetingUrl}
                              </a>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2 h-8 w-8 p-0"
                                onClick={() => window.open(meetingUrl, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {hostMeetingUrl && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Host URL (Veterinarian)</p>
                            <div className="flex items-center">
                              <a 
                                href={hostMeetingUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-mono text-sm truncate max-w-md"
                              >
                                {hostMeetingUrl}
                              </a>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2 h-8 w-8 p-0"
                                onClick={() => window.open(hostMeetingUrl, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {testStatus === 'error' && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                        <p className="font-medium text-red-800">Error: {error}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Test Logs</CardTitle>
                <CardDescription>
                  Detailed logs from the test process
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm overflow-auto max-h-96">
                  {logs.length === 0 ? (
                    <p className="text-gray-400">No logs yet. Run a test to see logs.</p>
                  ) : (
                    <div className="space-y-1">
                      {logs.map((log, index) => (
                        <div key={index} className={`
                          ${log.type === 'error' ? 'text-red-400' : ''}
                          ${log.type === 'success' ? 'text-green-400' : ''}
                          ${log.type === 'info' ? 'text-blue-400' : ''}
                        `}>
                          [{new Date().toLocaleTimeString()}] {log.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="help">
            <Card>
              <CardHeader>
                <CardTitle>Testing Instructions</CardTitle>
                <CardDescription>
                  How to properly test your Whereby integration
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Step 1: Create a Test Meeting</h3>
                    <p className="text-gray-600">Click the "Create Test Meeting" button to generate a temporary meeting room.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Step 2: Open Multiple Browser Windows</h3>
                    <p className="text-gray-600">
                      For a proper test, you need to simulate both sides of the call:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                      <li>Open the <strong>Participant URL</strong> in one browser window (as the pet owner)</li>
                      <li>Open the <strong>Host URL</strong> in another browser window (as the veterinarian)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Step 3: Verify Video and Audio</h3>
                    <p className="text-gray-600">
                      In both windows, make sure to:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                      <li>Grant camera and microphone permissions when prompted</li>
                      <li>Verify that your camera preview is visible</li>
                      <li>Test audio by speaking and checking if sound levels indicate detection</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Step 4: Test Connection</h3>
                    <p className="text-gray-600">
                      Verify that both participants can see and hear each other. Test the following features:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                      <li>Mute/unmute audio</li>
                      <li>Enable/disable video</li>
                      <li>Screen sharing functionality</li>
                      <li>Chat functionality</li>
                    </ul>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <h3 className="text-lg font-medium">Troubleshooting</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-600">
                      <li>
                        <strong>API errors:</strong> Check that your server is running and the Whereby API key is correctly set in the .env file
                      </li>
                      <li>
                        <strong>Permission issues:</strong> Make sure to allow camera and microphone access in your browser settings
                      </li>
                      <li>
                        <strong>Connection problems:</strong> Verify your internet connection and try using a different browser
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
