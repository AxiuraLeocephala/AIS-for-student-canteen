import { useEffect, useRef, useState } from "react";

import { useMainContext } from "./../../../context/mainContext.js";
import MainHeader from "./../mainHeader/mainHeader.jsx";
import Table from "./table.jsx";
import HeaderRight from "./../headerRight/headerRight.jsx";
import PopupCheckCodeReceive from "./../headerRight/popupCheckCodeReceive.jsx";
import "./../../../style/orderADelivery.css";

const OrderADelivery = ({ listOrders }) => {
    const columnRef = useRef();
    const orderList = useRef();
    const [isPopupShow, setIsPopupShow] = useState(false);
    const { view, targetOrderADeliveryPopup, visibilityState } = useMainContext();

    const activePopup = () => {
        // if (!isPopupShow && Object.keys(visibilityState).length > 0) throw new Error("Подтвердите выдачу заказа")
        setIsPopupShow(prevState => !prevState);
    }

    useEffect(() => {
        if (targetOrderADeliveryPopup) {
            columnRef.current.style.overflow = "";
            orderList.current.scrollTo({
                top: targetOrderADeliveryPopup.offsetTop - 60,
                behavior: 'smooth'
            });
            setIsPopupShow(false);
        }
    }, [targetOrderADeliveryPopup])

    return (
        <div className={`column-wrapper await-delivery ${view !== "ADelivery" && ("margin-right")}`}>
            {view === "ADelivery" && (<MainHeader/>)}
            <div className="column" ref={columnRef}>
                <div className="column-header">
                    <div className="header-top third">
                        Ожидают выдачи 
                        <div className="order-counter">
                            {listOrders.ADelivery.length}
                        </div>
                    </div>
                </div>
                <HeaderRight activePopup={activePopup}/>
                <div className={`order-list ${view === "ADelivery" && ("central")}`} ref={orderList}>
                    {listOrders.ADelivery.map((order, id) => {
                        return <Table key={id} order={order}/>
                    })}
                </div>
                {isPopupShow && <PopupCheckCodeReceive activePopup={activePopup} columnRef={columnRef}/>}
            </div>
        </div>
    )
}

export default OrderADelivery;