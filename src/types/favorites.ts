// Represents a product item in the user's favorites list
export interface FavoriteProduct {
  guitarId: string; // Corresponds to _id in Product/Guitar type
  guitarImg: string;
  guitarName: string;
  guitarCost: number;
  guitarAmount: number; // Stock/availability of the product
}
