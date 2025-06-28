import React, { useState } from "react";
import countTotalPrice from "./../features/countTotalPrice.js";
import ProductItemBusket from "./productItemBusket.jsx";
import { tg } from "./../hooks/useTelegram.js"
import './../styles/productListBusket.css';

const ProductListBusket = ({ productsInBusket, isChange }) => {
    const [totalPrice, setTotalPrice] = useState(productsInBusket === undefined ? 0:countTotalPrice(productsInBusket));
    const [isEmpty, setIsEmpty] = useState(productsInBusket === undefined ? true:false);

    const updateTotalPrice = () => {
        if (isEmpty) {
            setTotalPrice(0);
            tg.MainButton.hide();
        } else {
            setTotalPrice(countTotalPrice(productsInBusket))
        }
    }

    const checkArray = () => {
        return productsInBusket.every(elem => elem === undefined);
    };

    const deleteItemBusket = (index) => {
        delete productsInBusket[index];
        setIsEmpty(checkArray());
    };

    return (
        <>
            <div className="qb6">
                <span>
                    {totalPrice} ₽
                </span>
                <span>КОРЗИНА</span>
            </div>
            {isChange && (
                <div className="warning">
                    * Некоторые из выбранных вами блюд попали в стоп-лист, поэтому их здесь нет 
                </div>
            )}
            {isEmpty ? (
                <div className="alertItem">ПУСТО</div>
            ) : (
                <div className="productListBusket" style={{marginTop: isChange ? "0":"60px"}}>
                    {productsInBusket.map((product, idx) => {
                        return (
                            <ProductItemBusket 
                            key={idx} 
                            index={idx} 
                            product={product} 
                            updateTotalPrice={updateTotalPrice} 
                            deleteItem={deleteItemBusket}
                            />
                        )
                    })}
                </div>
            )}
        </>
    )
}

export default ProductListBusket;