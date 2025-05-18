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

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || '');

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
      onSuccess();
      onClose();
    } else {
      alert('Оплата не удалась');
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
