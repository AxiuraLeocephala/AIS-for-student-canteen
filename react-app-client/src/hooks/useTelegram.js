import countTotalPrice from "../features/countTotalPrice.js";
import { useNavigate } from 'react-router-dom'
import { MakeOrder } from "./../services/makeOrder.js";

export const tg = window.Telegram.WebApp;
tg.expand()

export function useTelegramOnMenu(data) {
    const navigate = useNavigate();

    tg.MainButton.onClick(() => {});
    tg.BackButton.onClick(() => {});
    tg.MainButton.show();
    tg.BackButton.hide();

    const totalPrice = countTotalPrice(data);
    tg.MainButton.text = `Корзина ${totalPrice === 0 ? ("") : (`${totalPrice} ₽`)}`;
    tg.MainButton.onClick(() => {
        tg.MainButton.hide();
        navigate("/basket");
    });
}

export function useTelegramOnBusket(productListBusket) {
    const navigate = useNavigate();
    tg.MainButton.onClick(() => {});
    tg.BackButton.onClick(() => {});
    tg.BackButton.show();
    productListBusket ? tg.MainButton.show() : tg.MainButton.hide();

    if (productListBusket !== undefined) {
        tg.MainButton.text = "Продолжить";
        tg.MainButton.show();
        tg.MainButton.onClick(() => {
            tg.MainButton.hide();
            navigate("/order");
        })
    }
    tg.BackButton.onClick(() => {
        tg.MainButton.hide();
        tg.BackButton.hide();
        navigate("/menu");
    });
}

export function useTelegramOnOrder(paymentDispute, totalPrice) {
    const navigate = useNavigate();
    tg.MainButton.onClick(() => {});
    tg.BackButton.onClick(() => {});
    tg.BackButton.show();
    totalPrice > 0 ? tg.MainButton.show() : tg.MainButton.hide();

    if (totalPrice > 0) {
        tg.MainButton.text = "Заказать";
        tg.MainButton.show();
        tg.MainButton.onClick(() => {
            tg.MainButton.hide();
            MakeOrder(paymentDispute);
        })
    }
    tg.BackButton.onClick(() => {
        tg.MainButton.hide();
        navigate('/basket');
    })
}