export interface Guitar {
  _id: string;
  img: string;
  name: string;
  cost: number;
  amount: number;
  type: string;
  brand?: string;
  popularity?: number; 
  description?: string;
  seller: {
    login: string;
    name: string;
    phone: string;
  };
}

export interface ModalWindowProps {
  guitar: Guitar;
}