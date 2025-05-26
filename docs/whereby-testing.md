# Whereby Video Call Testing Guide

## Prerequisites

- Ensure your Whereby API key is properly configured in the environment variables
- Verify your account has permissions to create and manage meetings

## Testing Checklist

1. **Test Meeting Creation**
   - Create a new booking with "Video Call" consultation type
   - Verify the meeting URLs are generated (both for participant and host)
   - Check that meeting details are stored in the database

2. **Test Joining as a Pet Owner**
   - Log in as a pet owner with a scheduled video appointment
   - Navigate to the appointments section
   - Click on the "Join Video Call" button
   - Verify the meeting loads correctly
   - Test microphone and camera permissions

3. **Test Joining as a Veterinarian**
   - Log in as a vet with a scheduled video appointment
   - Navigate to the appointments section
   - Click on the "Host Video Call" button
   - Verify the host meeting loads with proper controls
   - Test host-specific features (waiting room, participant management)

4. **Test Cross-Browser Compatibility**
   - Test on Chrome, Firefox, Safari, and Edge
   - Verify mobile browser compatibility (iOS Safari, Android Chrome)
   - Check responsive design of the video interface

5. **Test Connection Issues**
   - Simulate poor network conditions
   - Verify reconnection behavior
   - Test fallback mechanisms

## Production Considerations

1. **API Key Security**
   - Verify the Whereby API key is only used server-side
   - Ensure it's properly stored in environment variables
   - Confirm it's not exposed in client-side code or browser network requests

2. **Meeting Cleanup**
   - Verify orphaned meetings are properly cleaned up
   - Test the meeting cleanup process for failed bookings

3. **Error Handling**
   - Verify user-friendly error messages when video calls fail
   - Test fallback options (e.g., rescheduling to phone call)

4. **Performance**
   - Monitor server load during multiple concurrent video sessions
   - Check for memory leaks or performance degradation
