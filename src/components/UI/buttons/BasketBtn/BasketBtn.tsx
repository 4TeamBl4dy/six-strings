import '../styles.css';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { Guitar } from 'src/types';
import { useBasket } from 'src/contexts';

// Тип для пропсов компонента
interface BasketBtnProps {
    guitar: Guitar;
}

export const BasketBtn = ({ guitar }: BasketBtnProps) => {
    const isOutOfStock = guitar.amount === 0; // Проверяем, есть ли товар в наличии
    const { addToBasket, isItemInBasket } = useBasket();
    const currentlyInBasket = isItemInBasket(guitar._id);

    const handleAddToBasket = () => {
        addToBasket(guitar);
    };

    return (
        <button
            className="basketBtn"
            onClick={handleAddToBasket}
            disabled={isOutOfStock || currentlyInBasket} // Отключаем кнопку, если товара нет в наличии или он уже в корзине
            style={{
                cursor: isOutOfStock || currentlyInBasket ? 'not-allowed' : 'pointer',
                opacity: isOutOfStock || currentlyInBasket ? 0.5 : 1,
            }}
        >
            <AddShoppingCartIcon />
        </button>
    );
};
