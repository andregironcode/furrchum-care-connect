import { supabase } from '@/integrations/supabase/client';
import { sendBookingConfirmationEmail, sendVetBookingConfirmationEmail } from './emailService';
import { scheduleAppointmentReminder } from './scheduledReminders';

// Define types for database entities
interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  consultation_type: string;
  notes?: string;
  pet_id: string;
  pet_owner_id: string;
  vet_id: string;
  meeting_url?: string;
  status: string;
  payment_status: string;
}

interface Profile {
  id: string;
  email?: string; // Make email optional to match the actual database schema
  full_name?: string;
  first_name?: string;
}

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
}

interface VetProfile {
  id: string;
  first_name: string;
  last_name: string;
}

interface BookingDetails {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  consultation_type: string;
  pet_id: string;
  pet_owner_id: string;
  vet_id: string;
  notes?: string;
  meeting_url?: string;
}

/**
 * Send booking confirmation email to both client and vet, and schedule a reminder
 * Call this function after successful payment
 */
export async function sendBookingNotifications(bookingId: string): Promise<{ success: boolean; error?: any }> {
  try {
    // 1. Fetch the booking details from the database
    const bookingResponse = await supabase
      .from('bookings')
      .select(`
        id, 
        booking_date,
        start_time,
        end_time,
        consultation_type,
        notes,
        pet_id,
        pet_owner_id,
        vet_id,
        meeting_url
      `)
      .eq('id', bookingId)
      .single();
    
    if (bookingResponse.error) {
      console.error('Error fetching booking details:', bookingResponse.error);
      return { success: false, error: bookingResponse.error };
    }
    
    const booking = bookingResponse.data as Booking;
    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    // 2. Fetch pet owner details
    const ownerResponse = await supabase
      .from('profiles')
      .select('email, full_name, first_name')
      .eq('id', booking.pet_owner_id)
      .single();
    
    if (ownerResponse.error) {
      console.error('Error fetching pet owner details:', ownerResponse.error);
      return { success: false, error: ownerResponse.error };
    }
    
    // Make sure we have data before proceeding
    if (!ownerResponse.data) {
      return { success: false, error: 'Pet owner not found' };
    }
    
    // Safely cast the data to Profile type
    // First cast to unknown to avoid TypeScript error when converting directly
    const petOwner = ownerResponse.data as unknown as Profile;
    
    // Check if email exists, which is required for sending emails
    if (!petOwner.email) {
      return { success: false, error: 'Pet owner email not found' };
    }

    // 3. Fetch pet details
    const petResponse = await supabase
      .from('pets')
      .select('name, type, breed')
      .eq('id', booking.pet_id)
      .single();
    
    if (petResponse.error) {
      console.error('Error fetching pet details:', petResponse.error);
      return { success: false, error: petResponse.error };
    }
    
    const pet = petResponse.data as Pet;
    if (!pet) {
      return { success: false, error: 'Pet not found' };
    }

    // 4. Fetch vet details from vet_profiles table
    const vetResponse = await supabase
      .from('vet_profiles')
      .select('first_name, last_name')
      .eq('id', booking.vet_id)
      .single();
    
    if (vetResponse.error) {
      console.error('Error fetching vet details:', vetResponse.error);
      return { success: false, error: vetResponse.error };
    }
    
    const vet = vetResponse.data as VetProfile;
    if (!vet) {
      return { success: false, error: 'Vet not found' };
    }

    // 5. Fetch vet email from auth.users table using RPC function
    let vetEmail: string | null = null;
    try {
      const { data: emailData, error: emailError } = await (supabase as any)
        .rpc('get_user_email', { user_id: booking.vet_id });
      
      if (!emailError && emailData && emailData !== 'Email not available') {
        vetEmail = emailData;
      }
    } catch (error) {
      console.warn('Could not fetch vet email via RPC:', error);
    }

    // 6. Send booking confirmation email to pet owner
    const clientEmailResult = await sendBookingConfirmationEmail({
      user: {
        email: petOwner.email, // We've already checked that email exists
        fullName: petOwner.full_name || petOwner.first_name || 'Pet Owner', // Provide fallback
      },
      booking: {
        id: booking.id,
        bookingDate: booking.booking_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        consultationType: booking.consultation_type,
        petName: pet.name,
        vetName: `${vet.first_name} ${vet.last_name}`,
      },
    });

    if (!clientEmailResult.success) {
      console.error('Error sending client booking confirmation email:', clientEmailResult.error);
      // Continue even if email fails - don't block the user experience
    } else {
      console.log('Client booking confirmation email sent successfully');
    }

    // 7. Send booking confirmation email to veterinarian (if we have their email)
    if (vetEmail) {
      const vetEmailResult = await sendVetBookingConfirmationEmail({
        vet: {
          email: vetEmail,
          fullName: `${vet.first_name} ${vet.last_name}`,
          firstName: vet.first_name,
        },
        booking: {
          id: booking.id,
          bookingDate: booking.booking_date,
          startTime: booking.start_time,
          endTime: booking.end_time,
          consultationType: booking.consultation_type,
          petName: pet.name,
          ownerName: petOwner.full_name || petOwner.first_name || 'Pet Owner',
          ownerEmail: petOwner.email,
          notes: booking.notes,
        },
      });

      if (!vetEmailResult.success) {
        console.error('Error sending vet booking confirmation email:', vetEmailResult.error);
        // Continue even if email fails - don't block the user experience
      } else {
        console.log('Vet booking confirmation email sent successfully');
      }
    } else {
      console.log('Vet email not available, skipping vet confirmation email');
    }

    // 8. Schedule appointment reminder (30 minutes before)
    const reminderResult = scheduleAppointmentReminder({
      user: {
        email: petOwner.email,
        fullName: petOwner.full_name || petOwner.first_name,
      },
      booking: {
        id: booking.id,
        bookingDate: booking.booking_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        consultationType: booking.consultation_type,
        petName: pet.name,
        vetName: `${vet.first_name} ${vet.last_name}`,
        meetingUrl: booking.meeting_url,
      },
    });

    if (!reminderResult.success) {
      console.log('Appointment reminder not scheduled:', reminderResult.message);
      // Continue even if reminder scheduling fails
    } else {
      console.log('Appointment reminder scheduled successfully');
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendBookingNotifications:', error);
    return { success: false, error };
  }
}

/**
 * Process all existing bookings and schedule reminders for upcoming appointments
 * You can call this on application startup to ensure reminders are scheduled
 */
export async function scheduleRemindersForExistingBookings(): Promise<void> {
  try {
    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Get all confirmed bookings for today and future dates
    const bookingsResponse = await supabase
      .from('bookings')
      .select(`
        id, 
        booking_date,
        start_time,
        end_time,
        consultation_type,
        notes,
        pet_id,
        pet_owner_id,
        vet_id,
        meeting_url
      `)
      .gte('booking_date', today)
      .eq('status', 'confirmed')
      .eq('payment_status', 'paid');

    if (bookingsResponse.error) {
      console.log('Error fetching upcoming bookings:', bookingsResponse.error);
      return;
    }

    const bookings = bookingsResponse.data as Booking[];
    if (!bookings || bookings.length === 0) {
      console.log('No upcoming bookings found');
      return;
    }

    console.log(`Found ${bookings.length} upcoming bookings. Scheduling reminders...`);

    // For each booking, fetch details and schedule a reminder
    for (const booking of bookings) {
      try {
        // Fetch pet owner details
        const ownerResponse = await supabase
          .from('profiles')
          .select('email, full_name, first_name')
          .eq('id', booking.pet_owner_id)
          .single();

        if (ownerResponse.error) {
          console.log(`Error fetching owner for booking ${booking.id}:`, ownerResponse.error);
          continue;
        }

        // Safely check for data and cast to the correct type
        if (!ownerResponse.data) continue;
        const petOwner = ownerResponse.data as unknown as Profile;
        
        // Skip if no email is available
        if (!petOwner.email) {
          console.log(`Skipping reminder for booking ${booking.id}: Pet owner email not found`);
          continue;
        }

        // Fetch pet details
        const petResponse = await supabase
          .from('pets')
          .select('name')
          .eq('id', booking.pet_id)
          .single();

        if (petResponse.error) {
          console.log(`Error fetching pet for booking ${booking.id}:`, petResponse.error);
          continue;
        }

        const pet = petResponse.data as Pet;
        if (!pet) continue;

        // Fetch vet details
        const vetResponse = await supabase
          .from('vet_profiles')
          .select('first_name, last_name')
          .eq('id', booking.vet_id)
          .single();

        if (vetResponse.error) {
          console.log(`Error fetching vet for booking ${booking.id}:`, vetResponse.error);
          continue;
        }

        const vet = vetResponse.data as VetProfile;
        if (!vet) continue;

        // Schedule reminder
        scheduleAppointmentReminder({
          user: {
            email: petOwner.email, // We've verified this exists
            fullName: petOwner.full_name || petOwner.first_name || 'Pet Owner', // Provide fallback
          },
          booking: {
            id: booking.id,
            bookingDate: booking.booking_date,
            startTime: booking.start_time,
            endTime: booking.end_time,
            consultationType: booking.consultation_type,
            petName: pet.name,
            vetName: `${vet.first_name} ${vet.last_name}`,
            meetingUrl: booking.meeting_url,
          },
        });
      } catch (innerError) {
        console.error(`Error scheduling reminder for booking ${booking.id}:`, innerError);
        // Continue with next booking even if there's an error with the current one
      }
    }

    console.log('Reminder scheduling complete');
  } catch (error) {
    console.error('Error scheduling reminders for existing bookings:', error);
  }
}
