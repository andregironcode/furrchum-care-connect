import { sendAppointmentReminderEmail } from './emailService';

/**
 * Schedule a reminder email to be sent 30 minutes before an appointment
 * 
 * @param params Booking details and user information
 */
export function scheduleAppointmentReminder(params: {
  user: {
    email: string;
    fullName?: string;
    firstName?: string;
  };
  booking: {
    id: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    consultationType: string;
    petName: string;
    vetName: string;
    meetingUrl?: string;
  };
}) {
  const { booking } = params;
  
  // Convert booking date and time to a JavaScript Date object
  const [year, month, day] = booking.bookingDate.split('-').map(Number);
  const [hours, minutes] = booking.startTime.split(':').map(Number);
  
  // Create appointment date (months are 0-indexed in JavaScript)
  const appointmentDate = new Date(year, month - 1, day, hours, minutes);
  
  // Calculate reminder time (30 minutes before appointment)
  const reminderTime = new Date(appointmentDate.getTime() - 30 * 60 * 1000);
  
  // Get current time
  const currentTime = new Date();
  
  // Calculate delay in milliseconds
  const delayMs = reminderTime.getTime() - currentTime.getTime();
  
  // Only schedule if the reminder is in the future
  if (delayMs > 0) {
    console.log(`Scheduling reminder for appointment ${booking.id} at ${reminderTime.toLocaleString()}`);
    
    // Set a timeout to send the reminder at the appropriate time
    setTimeout(async () => {
      try {
        console.log(`Sending reminder for appointment ${booking.id}`);
        await sendAppointmentReminderEmail(params);
        console.log(`Reminder sent successfully for appointment ${booking.id}`);
      } catch (error) {
        console.error(`Error sending reminder for appointment ${booking.id}:`, error);
      }
    }, delayMs);
    
    return {
      success: true,
      scheduledTime: reminderTime.toISOString(),
      message: `Reminder scheduled for ${reminderTime.toLocaleString()}`
    };
  } else {
    console.log(`Appointment ${booking.id} is in the past or less than 30 minutes away`);
    return {
      success: false,
      message: 'Appointment is in the past or less than 30 minutes away'
    };
  }
}
