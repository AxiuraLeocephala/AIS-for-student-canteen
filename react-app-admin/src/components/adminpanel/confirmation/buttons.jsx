import { useRef } from "react";
import { useMainContext } from "../../../context/mainContext";
import "./../../../style/buttonsConfirm.css"

const Buttons = ({ order }) => {
    const rejectBtnRef = useRef(null);
    const acceptBtnRef = useRef(null);
    const { webSocket } = useMainContext();

    const wsSend = (order, action) => {
        webSocket.send(JSON.stringify({
            contentType: "rejectAcceptOrder",
            orderId: order["OrderId"], 
            userId: order["UserId"], 
            action: action
        })
    );
}

    const handleClickBtn = (e) => {
        if (e.target.className.includes("reject")) {
            if (rejectBtnRef.current.classList.value === "reject active") {
                wsSend(order, "reject");
            } else {
                const handleClickBody = () => {
                    if (rejectBtnRef.current.classList.value === "reject active") {
                        rejectBtnRef.current.classList.remove("active");
                        rejectBtnRef.current.innerHTML = "Отконить";
                        document.body.removeEventListener("click", handleClickBody);
                    } else {
                        rejectBtnRef.current.classList.add("active");
                        rejectBtnRef.current.innerHTML = "Подтвердить отклонение";
                    }
                }
                
                document.body.addEventListener("click", handleClickBody);
            }
        } else {
            if (acceptBtnRef.current.classList.value === "accept active") {
                wsSend(order, "accept");
            } else {
                const handleClickBody = () => {
                    if (acceptBtnRef.current.classList.value === "accept active") {
                        acceptBtnRef.current.classList.remove("active");
                        acceptBtnRef.current.innerHTML = "Принять";
                        document.body.removeEventListener("click", handleClickBody);
                    } else {
                        acceptBtnRef.current.classList.add("active");
                        acceptBtnRef.current.innerHTML = "Подтвердить принятие";
                    }
                }

                document.body.addEventListener("click", handleClickBody);
            }
        }
    }

    return (
        <div className="btn-space">
            <button className="reject" onClick={handleClickBtn} ref={rejectBtnRef}>Отклонить</button>
            <button className="accept" onClick={handleClickBtn} ref={acceptBtnRef}>Принять</button>
        </div>
    )
}

export default Buttons;