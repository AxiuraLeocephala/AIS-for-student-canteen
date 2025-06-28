import { useMainContext } from "./../../../context/mainContext.js";
import Button from "./button.jsx";
import "./../../../style/tableADelivery.css";

const Table = ({ order }) => {
    const {visibilityState} = useMainContext();
    const isVisible = visibilityState[order["OrderId"]] || false;

    const countTotalPrice = () => {
        let total = 0;
        order.Products.forEach(product => total += product["ProductPrice"])
        return total
    }

    return (
        <div className="order awaiting-delivery" id={order["OrderId"]}>
            <table>
                <tbody>
                    <tr>
                        <td className="order-id" colSpan={2}>№ {order["OrderId"]}</td>
                        <td className="order-payment-method">{order["PaymentMethod"]}</td>
                    </tr>
                    {order.Products.map((product, id) => {
                        return (
                            <tr key={id} className="row-product">
                                <td className="product-quantity">{product["Quantity"]}</td>
                                <td className="product-name" colSpan={1}>{product["ProductName"]}</td>
                                <td className="product-price">{product["ProductPrice"]} ₽</td>
                            </tr>
                        )
                    })}
                    {isVisible && (
                        <tr>
                            <td className="table-void" colSpan={2}>Итого: </td>
                            <td className="total-price">{countTotalPrice()} ₽</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <Button order={order}/>
        </div>
    )
}

export default Table;