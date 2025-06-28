import QualifierErrors from "./../layout/_qualifierErrors.js";
import mAxios from "./../features/setupAxios.js";

export async function LoaderBusket() {
    return mAxios.get(`product-api/data/productInBusket`)
    .then(response => response)
    .catch(error => QualifierErrors(error));
}