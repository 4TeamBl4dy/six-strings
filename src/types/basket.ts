export interface BasketItem {
  guitarId: string;
  guitarImg: string;
  guitarName: string;
  guitarCost: number;
  guitarCount?: number;
  guitarAmount: number;
}

export interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: () => void;
}