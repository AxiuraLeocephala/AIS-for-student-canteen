import React, { useEffect, useRef, memo} from "react";
import { useNavigate } from 'react-router-dom';
import { useLoaderData, useNavigation } from "react-router-dom";
import Preloader from "./../components/preloader.jsx";
import ProductListBusket from './../components/productListBusket.jsx';
import PopupMsg from './../components//popupMsg.jsx';
import { VisibilityProvider } from './../store/contextMsg.js';
import { tg } from "./../hooks/useTelegram.js";
import { ScheduleRefreshTokens, CancelRefreshTokens } from "./../services/authWrapper.js";
import './../styles/App.css';

const Busket = () => {
    const navigation = useNavigation();
    const navigate = useNavigate();
    const timerRef = useRef(null);
    const tastyCart = useLoaderData();
    const productListBusket = tastyCart.data[0];
    const isChange = tastyCart.data[1];
    const isLoading = navigation.state === "loading";

    const callbackOnClickMainButton = () => {
        tg.MainButton.hide();
        navigate("/order");
    }

    const callbackOnClickBackButton = () => {
        tg.MainButton.hide();
        tg.BackButton.hide();
        navigate("/menu");
    }

    useEffect(() => {
        tg.ready();
        tg.expand();
        if (productListBusket) {
            tg.MainButton.text = "Продолжить";
            tg.MainButton.onClick(callbackOnClickMainButton)
            tg.MainButton.show();
        }
        tg.BackButton.onClick(callbackOnClickBackButton);
        tg.BackButton.show();

        ScheduleRefreshTokens(timerRef)        
        return () => {
            tg.MainButton.offClick(callbackOnClickMainButton);
            tg.BackButton.offClick(callbackOnClickBackButton);
            CancelRefreshTokens(timerRef);
        };
    }, []);
    
    return ( 
        <>
            {isLoading ? 
                <Preloader/> :
                <>
                    <VisibilityProvider>
                        <PopupMsg/>
                        <ProductListBusket productsInBusket={productListBusket} isChange={isChange}/>
                    </VisibilityProvider>
                </>
                
            }
        </>
    )
}

export default Busket;