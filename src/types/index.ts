// src/types/index.ts

// From CatalogPage.tsx
export interface Seller {
  login: string;
  name: string;
  phone: string;
}

export interface Guitar {
  _id: string;
  img: string;
  name: string;
  cost: number;
  amount: number;
  type: string;
  brand?: string;
  description?: string;
  seller: Seller;
}

// From BasketPage.tsx
export interface BasketItem {
  guitarId: string; // Corresponds to Guitar._id
  guitarImg: string;
  guitarName: string;
  guitarCost: number;
  guitarCount: number;
  guitarAmount: number; // Available stock
}

// Placeholder for User state
export interface User {
  id: string | null;
  login: string | null;
  token: string | null;
  // Add other user-related fields as needed
}

// Generic Redux Action
export interface ReduxAction<T = any> {
  type: string;
  payload?: T;
}

// Placeholder for the RootState, to be expanded with reducers
export interface RootState {
  guitars: {
    items: Guitar[];
    loading: boolean;
    error: string | null;
  };
  basket: {
    items: BasketItem[];
    loading: boolean;
    error: string | null;
  };
  user: {
    currentUser: User | null;
    loading: boolean;
    error: string | null;
  };
  // Add other state slices here
}
