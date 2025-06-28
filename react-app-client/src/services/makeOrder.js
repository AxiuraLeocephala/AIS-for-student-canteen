import mAxios from './../features/setupAxios'
import {tg} from "./../hooks/useTelegram"
import QualifierErrors from './../layout/_qualifierErrors';

export async function MakeOrder(paymentMethod) {
    mAxios.post("product-api/data/makeOrder", {
        paymentMethod: paymentMethod
    })
    .then(response => tg.close())
    .catch(error => QualifierErrors(error))
}