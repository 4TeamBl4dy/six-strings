export interface Guitar {
  _id: string;
  img: string;
  name: string;
  cost: number;
  amount: number;
  type: string;
  brand?: string;
  description?: string;
  seller: {
    login: string;
    name: string;
    phone: string;
  };
}

export interface BasketItem {
  guitarId: string;
  guitarImg: string;
  guitarName: string;
  guitarCost: number;
  guitarCount: number;
  guitarAmount: number;
}

export interface FavoriteItem {
  guitarId: string;
  guitarImg: string;
  guitarName: string;
  guitarCost: number;
  guitarAmount: number;
}

export interface User {
  login: string;
  phone: string;
  name?: string;
  img?: string;
  password?: string;
}

export interface Saler {
  login: string;
  phone: string;
  name?: string;
  img?: string;
  password?: string;
}
