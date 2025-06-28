import mAxios from "../features/setupAxios";
import { tg } from "../hooks/useTelegram";
import QualifierErrors from "../layout/_qualifierErrors";

export function RequestIncrease(product, quantity, setQuantity, setComponentQuantity, locationCall, updateTotalPrice, setComponentVisibility) {
    mAxios.post('product-api/data/increaseQuantity', {
        productId: product["ProductId"]
    })
    .then(response => {
        product["Quantity"] += 1;
        setQuantity(prevState => prevState + 1);
        if (locationCall === "menu") {
            if (tg.MainButton.text.replace(/\D/g, '')) {
                tg.MainButton.text = `Корзина ${parseInt(tg.MainButton.text.replace(/\D/g, '')) + product["ProductPrice"]} ₽`;
            }
        } else if (locationCall === "busket") {
            updateTotalPrice();
        }
    })
    .catch(error => {
        if (error.response.status === 422) {
            setComponentQuantity(quantity);
            setComponentVisibility();
        } else {
            QualifierErrors(error);
        }
    })
}