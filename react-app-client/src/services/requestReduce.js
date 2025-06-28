import mAxios from "../features/setupAxios";
import { tg } from "../hooks/useTelegram";
import QualifierErrors from '../layout/_qualifierErrors';

export function RequestReduce(product, setQuantity, locationCall, deleteCard, updateTotalPrice, setButtonAddVisible) {
    mAxios.post('product-api/data/reduceNumber', {
        productId: product["ProductId"]
    })
    .then(response => {
        setQuantity(prevState => prevState - 1);
        const price = tg.MainButton.text.replace(/\D/g, '');
        
        if (typeof response.data.quantity !== "undefined") {
            product["Quantity"] = response.data.quantity;
            if (locationCall === "menu") {
                if (price) {
                    tg.MainButton.text = `Корзина ${parseInt(price) - product["ProductPrice"]} ₽`;
                }
            } else if (locationCall === "busket") {
                updateTotalPrice();
            }
        } else {
            product["Quantity"] = null;
            if (locationCall === "menu") {
                if (price !== '' && price !== `${product["ProductPrice"]}`){
                    tg.MainButton.text = `Корзина ${parseInt(price) - product["ProductPrice"]} ₽`;
                } else {
                    tg.MainButton.text = 'Корзина';
                }
                setButtonAddVisible(true);
            } else if (locationCall === "busket") {
                deleteCard();
                updateTotalPrice();
            }
        }
    })
    .catch(error => QualifierErrors(error))
}