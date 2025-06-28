import mAxios from '../features/setupAxios';
import {tg} from '../hooks/useTelegram'
import QualifierErrors from '../layout/_qualifierErrors';

export function RequestAdd(product, setQuantity, setButtonAddVisible) {
    mAxios.post('product-api/data/addToBusket', {
        productId: product["ProductId"]
    })
    .then(response => {
        product["Quantity"] = 1;
        setQuantity(1);
        if (tg.MainButton.text.replace(/\D/g, '') !== '') {
            tg.MainButton.text =
            `Корзина ${parseInt(tg.MainButton.text.replace(/\D/g, '')) + product["ProductPrice"]} ₽`;
        } else {
            tg.MainButton.text = `Корзина ${product["ProductPrice"]}`;
        }
        setButtonAddVisible(false);
    })
    .catch(error => QualifierErrors(error));
}