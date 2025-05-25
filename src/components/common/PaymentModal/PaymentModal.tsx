import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  CircularProgress,
} from '@mui/material';
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useToast } from 'src/components';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: () => void;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  amount,
  onSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const [paymentDetails, setPaymentDetails] = useState<{
    transactionId: string;
    date: string;
  } | null>(null);

  const loadFont = async () => {
    const response = await fetch('../../../../public/fonts/roboto-regular.ttf');
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Преобразуем Uint8Array в Base64
    let binary = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64String = btoa(binary);

    return base64String;
  };

  const handlePay = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement)!,
    });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          amount,
          paymentMethodId: paymentMethod.id,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        const transactionId = data.transactionId || 'TXN-' + Math.random().toString(36).substr(2, 9);
        const paymentDate = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' });

        setPaymentDetails({
          transactionId,
          date: paymentDate,
        });

        // Загружаем и добавляем шрифт
        const fontData = await loadFont();
        const doc = new jsPDF();
        doc.addFileToVFS('Roboto-Regular.ttf', fontData);
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.setFont('Roboto');

        doc.setFontSize(16);
        doc.text('Чек об оплате', 20, 20);
        doc.setFontSize(12);
        doc.text(`Дата и время: ${paymentDate}`, 20, 30);
        doc.text(`Сумма: ${amount.toFixed(2)} ₸`, 20, 40);
        doc.text(`ID транзакции: ${transactionId}`, 20, 50);
        doc.text('Магазин: SixStrings', 20, 60);
        doc.text('Спасибо за покупку!', 20, 70);

        doc.save(`SixStrings_Receipt_${transactionId}.pdf`);

        onSuccess();
        showToast('Оплата успешно прошла!', 'success')
        onClose();
      } else {
        showToast('Оплата не удалась', error);
      }
    } catch (error) {
      console.error('Ошибка при обработке платежа:', error);
      setLoading(false);
      showToast('Произошла ошибка при обработке платежа', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Оплата заказа</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" gutterBottom>
          К оплате: <strong>{(amount).toFixed(2)} ₸</strong>
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            p: 2,
            border: '1px solid #ccc',
            borderRadius: 2,
            backgroundColor: '#fafafa',
          }}
        >
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handlePay}
          fullWidth
          sx={{ ml: 1 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Оплатить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const PaymentModalWrapper: React.FC<PaymentModalProps> = (props) => (
  <Elements stripe={stripePromise}>
    <PaymentModal {...props} />
  </Elements>
);