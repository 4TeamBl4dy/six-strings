export interface BasketItem {
  guitarId: string;
  guitarImg: string;
  guitarName: string;
  guitarCost: number;
  guitarCount: number; // Quantity of this item IN THE BASKET
  guitarAmount: number; // Total available stock of the product
}

// Payload for adding a new item to the basket
// This might come from a product page or favorites page
export interface AddToBasketPayload {
  guitarId: string;
  guitarImg: string;
  guitarName: string;
  guitarCost: number;
  guitarAmount: number; // Total available stock, needed to initialize/validate basket item
  // quantity is typically assumed to be 1 when first adding, then adjusted in basket
}
