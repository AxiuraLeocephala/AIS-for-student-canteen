import React, { useRef, useEffect, useState } from 'react';
import { usePlatform } from "./../hooks/usePlatform.js";
import Button from './../layout/button.jsx';
import './../styles/productItemBusket.css';

const ProductItemBusket = ({ index, product, updateTotalPrice, deleteItem }) => {
    const [startPress, endPress] = usePlatform.getTypePress();
    const [isDelete, setIsDelete] = useState(false);
    const capsuleRef = useRef(null);
    const cardProductRef = useRef(null);
    const imgRef = useRef(null);
    const hRef = useRef(null);
    const pRef = useRef(null);
    const arrayElems = useRef([]);
    let timer = useRef(0);
    // const [localQuantity, setLocalQuantity] = useState(product["Quantity"]);
    
    // useEffect(() => {
    //     setLocalQuantity(product["Quantity"])
    // }, [product["Quantity"]])

    const deleteCard = () => {
        cardProductRef.current.classList.add('hide');
        setTimeout(() => {
            capsuleRef.current.style.height = '0px';
            setTimeout(() => {
                deleteItem(index);
                setIsDelete(true);
            }, 120)
        }, 200)
    };

    const addEventExpand = () => {
        cardProductRef.current.addEventListener(`${startPress}`, handleStartPress);
        cardProductRef.current.addEventListener(`${endPress}`, handleEndPress);
    };

    const removeEventExpand = () => {
        cardProductRef.current.removeEventListener(`${startPress}`, handleStartPress);
        cardProductRef.current.removeEventListener(`${endPress}`, handleEndPress);
    };

    const contractCard = () => {
        arrayElems.current.forEach((elem) => {
            if (elem.tagName === 'H3') {
                elem.style.webkitLineClamp = 1;
                hRef.current.style.height = '30px';
                pRef.current.style.top = '45px';
            } else {
                elem.style.webkitLineClamp= 2;
            }
        })
        cardProductRef.current.style.height = '100%';
        cardProductRef.current.style.boxShadow = '0 2px 10px rgba(0, 0, 0, .1)';
        imgRef.current.style.height = '100px';
        pRef.current.style.height = '42px';
        setTimeout(() => {
            cardProductRef.current.style.zIndex = 0;
            document.body.removeEventListener(`${startPress}`, contractCard);
            addEventExpand();
        }, 120);
    };

    const handleStartPress = (e) => {
        if (e.target.closest('.buttonSpaceBusket') === null) {
            cardProductRef.current.classList.add('entering');
            timer.current = setTimeout(() => {
                // handleEndPress(e);
                removeEventExpand();
                cardProductRef.current.classList.remove('entering');
                let totalHeightChange = 0;
                arrayElems.current.forEach(elem => {
                    totalHeightChange += elem.scrollHeight - elem.clientHeight;
                    if (elem.tagName === 'H3') {
                        hRef.current.style.height = `${elem.scrollHeight}px`;
                        pRef.current.style.top = `${15+elem.scrollHeight}px`;
                    }
                    elem.style.webkitLineClamp = 999;
                });
                cardProductRef.current.classList.add('entered');
                cardProductRef.current.style.zIndex = 2;
                cardProductRef.current.style.height = `${cardProductRef.current.clientHeight+totalHeightChange}px`;
                cardProductRef.current.style.boxShadow = '0 20px 20px rgba(0, 0, 0, 0.7)';
                imgRef.current.style.height = `${imgRef.current.clientHeight + totalHeightChange}px`;
                pRef.current.style.height = `${pRef.current.scrollHeight}px`;
                setTimeout(() => {
                    cardProductRef.current.classList.remove('entered');
                    document.body.addEventListener(`${startPress}`, contractCard);
                }, 120);
            }, 400);
        }
    };

    const handleEndPress = (e) => {
        if (e.target.closest('.buttonSpaceBusket') === null) {
            cardProductRef.current.classList.remove('entering');
            clearTimeout(timer.current);
        }
    };

    const isMoreThan = (elem) => {
        if (elem) {return elem.scrollHeight - elem.clientHeight > 1}
    };

    useEffect(() => {
        if (isMoreThan(hRef.current)) {
            arrayElems.current.push(hRef.current);
            if (isMoreThan(pRef.current)) {
                arrayElems.current.push(pRef.current);
            }
            addEventExpand();
        } else if (isMoreThan(pRef.current)) {
            arrayElems.current.push(pRef.current);
            addEventExpand();
        }
        return () => {
            arrayElems.current = [];
        }
    }, []);

    return (
        !isDelete && (
            <div ref={capsuleRef} className="capsule">
                <div ref={cardProductRef} className="cardProduct Busket">
                    <img src={`data:image/jpeg;base64,${product["ProductPhoto"]}`} alt='' ref={imgRef}/>
                    <h3 ref={hRef}>{product['ProductName']}</h3>
                    <div className='finalCost'>{product['ProductPrice']} ₽</div>
                    <p ref={pRef}>{product['ProductDescription']}</p>
                    <div className='totalPriceItem'>
                    <div>{product['ProductPrice'] * product["Quantity"]} ₽</div>
                    </div>
                    <div className='buttonSpaceBusket'>
                        <Button product={product} locationCall={'busket'} deleteCard={deleteCard} updateTotalPrice={updateTotalPrice}/>
                    </div>
                </div>
            </div>
        )
    )
}

export default ProductItemBusket;