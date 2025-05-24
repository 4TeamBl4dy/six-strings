// Represents user profile data
export interface UserProfile {
  login: string;
  phone: string;
  name?: string;
  img?: string; // URL to user's avatar
  // password should generally not be part of a client-side UserProfile model
  // if it's for update purposes, it should be a separate, specific type.
}

// Interface for password update data, if needed for a specific form/API call
export interface UserPasswordUpdate {
  currentPassword?: string; // Depending on API requirements
  newPassword?: string;
}

// Interface for user data that might be updated via a form
// This can be a subset of UserProfile or include other modifiable fields
export interface UserUpdateData {
  login?: string;
  phone?: string;
  name?: string;
  // img might be handled as a File object separately in forms
}
