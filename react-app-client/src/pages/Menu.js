import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoaderData, useNavigation } from 'react-router-dom';
import { tg } from './../hooks/useTelegram.js';
import countTotalPrice from './../features/countTotalPrice.js';
import Preloader from "./../components/preloader.jsx"
import Header from './../components/header.jsx';
import ProductList from './../components/productList.jsx';
import PopupMsg from './../components/popupMsg.jsx';
import { ScheduleRefreshTokens, CancelRefreshTokens } from "./../services/authWrapper.js";
import { VisibilityProvider } from './../store/contextMsg.js';
import './../styles/App.css';

const Menu = () => {
    const navigation = useNavigation();
    const navigate = useNavigate();
    const timerRef = useRef(null)
    const culinaryDetails = useLoaderData();
    const productCategories = culinaryDetails.data[0];
    const productInfo = culinaryDetails.data[1];
    const isLoading = navigation.state === "loading";
    const totalPrice = countTotalPrice(productInfo);

    const callbackOnClickMainButton = () => {
        tg.MainButton.hide();
        navigate("/basket");
    }

    useEffect(() => {
        tg.ready();
        tg.expand();
        tg.MainButton.text = `Корзина ${totalPrice === 0 ? ("") : (`${totalPrice} ₽`)}`;
        tg.MainButton.onClick(callbackOnClickMainButton);
        tg.MainButton.show();

        ScheduleRefreshTokens(timerRef)
        return () => {
            tg.MainButton.offClick(callbackOnClickMainButton);
            CancelRefreshTokens(timerRef);
        };
    }, []);
    
    return (
        <>
            {isLoading ? 
                <Preloader /> : 
            <>
                <Header productCategories={productCategories}/>
                <VisibilityProvider>
                    <PopupMsg/>
                    <ProductList productCategories={productCategories} productInfo={productInfo}/>
                </VisibilityProvider>
            </>
            }
        </>
    )
}

export default Menu;