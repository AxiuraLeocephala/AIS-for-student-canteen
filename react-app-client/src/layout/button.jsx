import {useState} from "react";
import { useVisibility } from "../store/contextMsg";
import { RequestAdd } from "../services/requestAdd";
import { RequestIncrease } from "../services/requestIncrease";
import { RequestReduce } from "../services/requestReduce";
import "./../styles/button.css";

const Button = ({ product, locationCall, deleteCard, updateTotalPrice }) => {
    const [isButtonAddVisible, setButtonAddVisible] = useState(product["Quantity"] === null);
    const {setComponentVisibility, setComponentQuantity} = useVisibility();
    const [quantity, setQuantity] = useState(product["Quantity"]);
    
    const handleClickMain = () => {
        RequestAdd(product, setQuantity, setButtonAddVisible);
    }

    const handleClickReduce = () => {
        RequestReduce(product, setQuantity, locationCall, deleteCard, updateTotalPrice, setButtonAddVisible);
    }

    const handleClickIncrease = () => {
        RequestIncrease(product, quantity, setQuantity, setComponentQuantity, locationCall, updateTotalPrice, setComponentVisibility);
    }

    return (
        <div className="buttonSpace">
            {product["Stop"] === 0 && (
                isButtonAddVisible ? (
                    <>
                        <button className="buttonAddToBusket" onClick={handleClickMain}>
                            {product["ProductPrice"]} ₽
                        </button>
                    </>
                ) : (
                    <>
                        <button className="buttonReduce" onClick={handleClickReduce}>-</button>
                        <input className="quantity" type="text" readOnly value={quantity}/>
                        <button className="buttonIncrease" onClick={handleClickIncrease}>+</button>
                    </>
                )
            )}
            
        </div>
    )
}

export default Button;