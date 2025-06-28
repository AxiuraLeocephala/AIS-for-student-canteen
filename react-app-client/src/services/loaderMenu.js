import QualifierErrors from "./../layout/_qualifierErrors";
import mAxios from "./../features/setupAxios";

export async function LoaderMenu() {
    return mAxios.get(`product-api/data/priceList`)
    .then(response => response)
    .catch(error => QualifierErrors(error));
}