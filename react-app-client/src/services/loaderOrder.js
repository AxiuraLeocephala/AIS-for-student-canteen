import QualifierErrors from "./../layout/_qualifierErrors";
import mAxios from "./../features/setupAxios";

export async function LoaderOrder() {
    return mAxios.get("product-api/data/order")
    .then(response => response)
    .catch(error => QualifierErrors(error))
} 