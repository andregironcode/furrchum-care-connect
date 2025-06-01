// Utility functions for admin dashboard

/**
 * Get user email based on user ID - this is a hardcoded mapping for demo/development purposes
 * In a production environment, this would be replaced by proper database queries or auth API calls
 */
export const getUserEmailById = (userId: string): string => {
  // Map of user IDs to emails
  const userEmailMap: Record<string, string> = {
    // Known user mappings - add your test users here
    'af36086e-6131-4ba2-997d-ae46a3ffca11': 'vetuser@example.com',
    // Add more user ID to email mappings as needed
  };

  // Return the mapped email or a default if not found
  return userEmailMap[userId] || `user-${userId.slice(0, 8)}@furrchum.example.com`;
};

/**
 * Creates a display email for a user based on various possible sources
 */
export const getDisplayEmail = (user: { id: string; email?: string; user_type?: string }): string => {
  // If email is directly available, use it
  if (user.email) return user.email;
  
  // Otherwise use our mapping function
  return getUserEmailById(user.id);
};
