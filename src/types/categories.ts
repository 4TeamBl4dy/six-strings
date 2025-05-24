// Represents a category item, often used for filtering and display
export interface Category {
  id?: string;      // Unique identifier for the category (if available from backend)
  value: string;   // Value used for filtering (e.g., 'electric', 'acoustic')
  label: string;   // Display label for the category (e.g., 'Электрические гитары')
  name?: string;    // Alternative or additional name field (if needed)
  // Add other properties like 'img' if categories can have images, etc.
}
