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
import React, { useState, useEffect } from 'react'; // Added useEffect
import { jsPDF } from 'jspdf';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from 'src/store/store';
import { processPaymentThunk, resetPaymentState } from 'src/store/paymentSlice';
// processPayment API function is no longer directly used here

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
  const dispatch: AppDispatch = useDispatch();
  const { isLoading: paymentLoading, error: paymentError, paymentSuccessDetails } = useSelector((state: RootState) => state.payment);
  // const [loading, setLoading] = useState(false); // Replaced by paymentLoading from Redux
  // const [paymentDetails, setPaymentDetails] = useState<{ // This local state might not be needed if details are in Redux or handled by PDF generation directly
  //   transactionId: string;
  //   date: string;
  // } | null>(null);

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

    // setLoading(true); // Handled by Redux thunk
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
        console.error("CardElement not found");
        return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error || !paymentMethod) {
      console.error(error || "PaymentMethod not created");
      // setLoading(false); // Handled by Redux thunk
      alert(error?.message || "Не удалось обработать данные карты.");
      return;
    }

    dispatch(processPaymentThunk({ amount, paymentMethodId: paymentMethod.id }));
  };

  useEffect(() => {
    const generatePdfAndFinalize = async () => {
        if (paymentSuccessDetails?.success && paymentSuccessDetails.transactionId) {
            const transactionId = paymentSuccessDetails.transactionId;
            const paymentDate = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' });
            
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
            alert('Оплата успешно прошла!');
            onClose(); // Close modal on success
            dispatch(resetPaymentState()); // Reset payment state in Redux
        } else if (paymentSuccessDetails && !paymentSuccessDetails.success) {
            // Handle case where API returns success:false (but not a network/server error caught by .rejected)
            alert('Оплата не удалась. Пожалуйста, попробуйте снова.');
            dispatch(resetPaymentState());
        } else if (paymentError) {
            alert('Оплата не удалась: ' + paymentError);
            dispatch(resetPaymentState());
            // onClose(); // Optionally close modal on error too, or let user retry
        }
    };
    
    if (paymentSuccessDetails || paymentError) {
        generatePdfAndFinalize();
    }
  }, [paymentSuccessDetails, paymentError, dispatch, onSuccess, amount, onClose]);


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
        <Button onClick={onClose} disabled={paymentLoading}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handlePay}
          fullWidth
          sx={{ ml: 1 }}
          disabled={paymentLoading || !stripe || !elements} // Disable if stripe/elements not loaded
        >
          {paymentLoading ? <CircularProgress size={24} color="inherit" /> : 'Оплатить'}
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