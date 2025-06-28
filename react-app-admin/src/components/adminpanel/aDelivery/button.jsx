import { useRef } from "react";
import { useMainContext } from "./../../../context/mainContext.js";
import "./../../../style/buttonADelivery.css";

const Button = ({ order }) => {
    const { webSocket, visibilityState } = useMainContext();
    const isVisible = visibilityState[order["OrderId"]] || false;
    const btnRef = useRef(null);

    const handleClickBtn = () => {
        if (btnRef.current.classList.value === "active") {
            webSocket.send(JSON.stringify({
                "contentType": "orderIssued",
                "orderId": order["OrderId"],
                "userId": order["UserId"]
            }))
        } else {
            const handleClickBody = () => {
                if (btnRef.current.classList.value === "active") {
                    document.body.removeEventListener("click", handleClickBody);
                    btnRef.current.classList.remove("active");
                    btnRef.current.innerHTML = "Заказ выдан";

                } else {
                    btnRef.current.classList.add("active");
                    btnRef.current.innerHTML = "Подтвердить выдачу";
                }
            }

            document.body.addEventListener("click", handleClickBody);
        }
    }

    return (
        <>
            {isVisible && (
                <div className="btn-space">
                    <button onClick={handleClickBtn} ref={btnRef}>Заказ выдан</button>
                </div>
            )}
        </> 
    )
}

export default Button;