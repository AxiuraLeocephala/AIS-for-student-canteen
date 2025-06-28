import React, { useEffect, useRef, useState } from 'react';
import { usePlatform } from './../hooks/usePlatform.js';
import Button from './../layout/button.jsx';
import Popup from './popup.jsx';
import './../styles/productItem.css';

const ProductItem = ({ product }) => {
    const [startPress, endPress] = usePlatform.getTypePress();
    const cardProductRef = useRef(null);
    const [isPopupShow, setIsPopupShow] = useState(false);
    const [isButtonShow, setIsButtonShow] = useState(true);
    const [optionsCard, setOptionsCard] = useState(null);
    let observer;
    let timer = 0;
    let scrolled = false;

    const updateOptions = () => { 
        return cardProductRef.current.getBoundingClientRect() 
    };

    const popupClose = () => {
        cardProductRef.current.classList.remove('hide');
        setIsPopupShow(false);
    };

    const hideButton = () => { 
        setIsButtonShow(false) 
    };

    const showButton = () => { 
        setIsButtonShow(true) 
    };

    const expandCard = () => {
        cardProductRef.current.classList.remove('entering');
        cardProductRef.current.classList.add('hide');
        setOptionsCard(updateOptions);
        setIsPopupShow(true);
        if (observer) {
            window.removeEventListener('scroll', observer);
            observer = null;
        }
    };

    const waitUntilCardInPosition = (targetPosition) => {
        observer = () => {
            requestAnimationFrame(() => {
                if (Math.abs( window.scrollY - targetPosition) <= 1) {
                    expandCard();
                }
            });
        };
        window.addEventListener('scroll', observer);
    };

    const onScroll = () => {
        scrolled = true;
        clearTimeout(timer);
        window.removeEventListener('scroll', onScroll);
    };

    const handleStartPress = (e) => {
        if (e.target.closest('.buttonSpace') === null) {
            scrolled = false;
            window.addEventListener('scroll', onScroll, { once: true });
            cardProductRef.current.classList.add('entering');
            const options = updateOptions();
            timer = setTimeout(() => {
                window.removeEventListener('scroll', onScroll);
                if (scrolled) return;
                const targetPosition = cardProductRef.current.offsetTop - window.innerHeight / 8;
                if (options.top >= 55) {
                    if (options.bottom <= window.innerHeight) {
                        expandCard();
                    } else {
                        waitUntilCardInPosition(targetPosition)
                        window.scroll({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                } else {
                    waitUntilCardInPosition(targetPosition)
                    window.scroll({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 400);
        }
    };
    const handleEndPress = () => {
        cardProductRef.current.classList.remove('entering');
        clearTimeout(timer);
    };
    
    useEffect(() => {
        const cardProduct = cardProductRef.current;
        cardProduct.addEventListener(`${startPress}`, handleStartPress);
        cardProduct.addEventListener(`${endPress}`, handleEndPress);
        
        return () => {
            cardProduct.removeEventListener(`${startPress}`, handleStartPress);
            cardProduct.removeEventListener(`${endPress}`, handleEndPress);
        }
    });

    return (
        <>
            <div 
                ref={cardProductRef} 
                className='cardProduct Menu'
            >
                <picture>
                    {product["Stop"] === 1 && (
                        <div className='surface-stop'>СТОП</div>
                    )}
                    <img src={`data:image/jpeg;base64,${product["ProductPhoto"]}`} alt=''/>
                </picture>
                <h3>{product["ProductName"]}</h3>
                <p>{product["ProductDescription"]}</p>
                {isButtonShow && (<Button product={product} locationCall={'menu'}/>)}
            </div>
            {isPopupShow && (
                <Popup 
                    product={product} 
                    options={optionsCard}
                    onClose={popupClose}
                    hideButton={hideButton}
                    showButton={showButton}
                    cardProduct={cardProductRef.current}
                />
            )}
        </>
    );
}

export default React.memo(ProductItem);