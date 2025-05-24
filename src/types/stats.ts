// Represents a detailed item for statistical records (e.g., a specific product interaction)
export type DetailItem = {
  date: string;        // Date of the event
  productId: string;   // ID of the product involved
  productName: string; // Name of the product involved
  userId: string;      // ID of the user involved
  userLogin: string;   // Login of the user involved
};

// Represents a summary item for statistics, typically grouped by a key (e.g., date)
export type StatItem = {
  _id: string;  // The key for grouping (e.g., date as string)
  total: number; // The total count for this group
};
