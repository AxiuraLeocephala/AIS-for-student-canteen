import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import { useLoaderData, useNavigation } from "react-router-dom";
import Preloader from "./../components/preloader.jsx";
import OrderList from "./../components/orderList.jsx";
import { tg } from './../hooks/useTelegram';
import { ScheduleRefreshTokens, CancelRefreshTokens } from "./../services/authWrapper.js";
import './../styles/App.css';
import { MakeOrder } from '../services/makeOrder.js';

function Order() {
    const navigation = useNavigation();
    const navigate = useNavigate();
    const timerRef = useRef(null);
    const [paymentMethod, setPaymentMethod] = useState('CARD');
    const detailOrder = useLoaderData();
    const isLoading = navigation.state === "loading";

    const callbackOnClickMainButton = () => {
        tg.MainButton.hide();
        MakeOrder(paymentMethod);
    }

    const callbackOnClickBackButton = () => {
        tg.MainButton.hide();
        navigate("/basket");
    }

    useEffect(() => {
        if (detailOrder.data["totalPrice"]) {
            tg.MainButton.text = "Заказать";
            tg.MainButton.onClick(callbackOnClickMainButton);
            tg.MainButton.show();
        }
        tg.BackButton.onClick(callbackOnClickBackButton);

        ScheduleRefreshTokens(timerRef)        
        return () => {
            tg.MainButton.offClick(callbackOnClickMainButton);
            tg.BackButton.offClick(callbackOnClickBackButton);
            CancelRefreshTokens(timerRef);
        };
    }, [])

    return (
        <> 
            {isLoading ? 
                <Preloader/> :
                <>
                    <OrderList setPaymentMethod={setPaymentMethod} detailOrder={detailOrder}/>
                </>
            }
        </>
    )
}

export default Order;