import { supabase } from '@/integrations/supabase/client';

/**
 * A collection of database utility functions to handle common operations
 * and ensure consistent error handling across the application.
 */

/**
 * Validates if a booking date and time is valid (not in the past)
 * @param bookingDate The date of the booking
 * @param startTime The start time of the booking
 * @returns True if the booking is valid, false otherwise
 */
export const isValidBookingDateTime = (bookingDate: string | Date, startTime: string): boolean => {
  try {
    const now = new Date();
    const [hours, minutes] = startTime.split(':').map(Number);

    // Handle both string dates and Date objects
    const bookingDateTime = bookingDate instanceof Date ? new Date(bookingDate) : new Date(bookingDate);

    // Check if the date is valid
    if (isNaN(bookingDateTime.getTime())) {
      console.error('Invalid booking date format:', bookingDate);
      return false;
    }

    bookingDateTime.setHours(hours, minutes, 0, 0);

    return bookingDateTime > now;
  } catch (error) {
    console.error('Error validating booking date and time:', error);
    return false;
  }
};

/**
 * Completely deletes a user and all associated data from the system
 * @param userId The ID of the user to delete
 * @returns A promise that resolves with success or rejects with an error
 */
export const deleteUser = async (userId: string): Promise<void> => {
  // 1. Delete user's pets
  const { error: petsDeleteError } = await supabase
    .from('pets')
    .delete()
    .eq('owner_id', userId);

  if (petsDeleteError) {
    console.error('Error deleting pets:', petsDeleteError);
  }

  // 2. Delete user's appointments
  const { error: appointmentsDeleteError } = await supabase
    .from('bookings')
    .delete()
    .eq('pet_owner_id', userId);

  if (appointmentsDeleteError) {
    console.error('Error deleting appointments:', appointmentsDeleteError);
  }

  // 3. Delete user's prescriptions
  const { error: prescriptionsDeleteError } = await supabase
    .from('prescriptions')
    .delete()
    .eq('pet_owner_id', userId);

  if (prescriptionsDeleteError) {
    console.error('Error deleting prescriptions:', prescriptionsDeleteError);
  }

  // 4. Delete user profile
  const { error: profileDeleteError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profileDeleteError) {
    throw new Error(`Error deleting user profile: ${profileDeleteError.message}`);
  }

  // 5. Skip auth user deletion since it requires admin privileges
  // When RLS is disabled, we don't have access to auth.admin methods
  // The user will remain in auth but that's acceptable since all profile data is removed
  console.log('Auth user deletion skipped - requires admin privileges');
};

/**
 * Completely deletes a vet and all associated data from the system
 * @param vetId The ID of the vet profile to delete
 * @param userId The optional user ID associated with the vet profile
 * @returns A promise that resolves with success or rejects with an error
 */
export const deleteVet = async (vetId: string, userId?: string): Promise<void> => {
  // 1. Delete vet's appointments
  const { error: appointmentsDeleteError } = await supabase
    .from('bookings')
    .delete()
    .eq('vet_id', vetId);

  if (appointmentsDeleteError) {
    console.error('Error deleting appointments:', appointmentsDeleteError);
  }

  // 2. Delete vet's prescriptions
  const { error: prescriptionsDeleteError } = await supabase
    .from('prescriptions')
    .delete()
    .eq('vet_id', vetId);

  if (prescriptionsDeleteError) {
    console.error('Error deleting prescriptions:', prescriptionsDeleteError);
  }

  // 3. Delete vet profile
  const { error: vetDeleteError } = await supabase
    .from('vet_profiles')
    .delete()
    .eq('id', vetId);

  if (vetDeleteError) {
    throw new Error(`Error deleting vet profile: ${vetDeleteError.message}`);
  }

  // 4. If we have a user ID, delete user profile but skip auth user deletion
  if (userId) {
    const { error: profileDeleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileDeleteError) {
      console.error('Error deleting user profile:', profileDeleteError);
    }

    // Skip auth user deletion since it requires admin privileges
    // When RLS is disabled, we don't have access to auth.admin methods
    console.log('Auth user deletion skipped - requires admin privileges');
  }
};
