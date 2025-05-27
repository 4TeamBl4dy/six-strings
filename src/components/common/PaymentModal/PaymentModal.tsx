import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
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
import { PaymentModalProps } from 'src/types';
import apiClient from 'src/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

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

const PaymentModal: React.FC<PaymentModalProps> = ({ open, onClose, amount, onSuccess }) => {
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
        if (!stripe || !elements) {
            console.error('Stripe.js has not yet loaded.');
            // Можно показать пользователю сообщение или просто выйти
            return;
        }

        setLoading(true);
        console.log('Creating payment method...');
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement)!,
        });

        if (error) {
            console.error('Error creating payment method:', error);
            setLoading(false);
            return;
        }

        console.log('Payment method created:', paymentMethod);

        try {
            console.log('Sending payment request to server...');
            const res = await apiClient.post(
                '/pay',
                {
                    amount,
                    paymentMethodId: paymentMethod.id,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    },
                }
            );

            console.log('Response from server:', res.data);

            setLoading(false);

            if (res.data.success) {
                console.log('Payment successful!');
                const transactionId = res.data.transactionId || 'TXN-' + Math.random().toString(36).substr(2, 9);
                const paymentDate = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' });

                setPaymentDetails({
                    transactionId,
                    date: paymentDate,
                });

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
                showToast('Оплата успешно прошла!', 'success');
                onClose();
            } else {
                console.log('Payment not successful...');
                showToast('Оплата не удалась', 'error');
            }
        } catch (error) {
            console.error('Error handling payment:', error);
            setLoading(false);
            showToast('Произошла ошибка при обработке платежа', 'error');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Оплата заказа</DialogTitle>
            <DialogContent>
                <Typography variant="subtitle1" gutterBottom>
                    К оплате: <strong>{amount.toFixed(2)} ₸</strong>
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
                <Button variant="contained" onClick={handlePay} fullWidth sx={{ ml: 1 }} disabled={loading}>
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
