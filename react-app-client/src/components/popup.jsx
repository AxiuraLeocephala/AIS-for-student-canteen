import React, {useEffect, useRef, useState} from 'react';
import Button from '../layout/button.jsx';
import './../styles/popup.css';

const Popup = ({ product, options, onClose, hideButton, showButton, cardProduct }) => {
    const [positionTop, setPositionTop] = useState(options.top);
    const popupRef = useRef(null);
    const overlayRef = useRef(null);

    const handleClick = (e) => {
        if (e.target.closest('.popup') === null) {
            overlayRef.current.classList.add('hide');
            showButton();
            setTimeout(() => {
                document.body.style.overflow = '';
                cardProduct.classList.remove('hide');
                setTimeout(() => { onClose() }, 200);
            }, 50);
        }
    };

    const showPopup = () => {
        document.body.style.overflow = 'hidden';
        setPositionTop(cardProduct.getBoundingClientRect().top);
        cardProduct.classList.add('hide');
        hideButton();
        overlayRef.current.classList.remove('hide');
        setTimeout(() => {overlayRef.current.addEventListener('click', handleClick)}, 200);
    }

    useEffect(() => {
        const targetPosition = cardProduct.offsetTop - window.innerHeight / 8;

        const waitUntilCardInPosition = () => {
            requestAnimationFrame(() => {
                if (Math.abs(window.scrollY - targetPosition) <= 1) {
                    window.removeEventListener('scroll', waitUntilCardInPosition);
                    showPopup();
                }
            });
        };

        if (popupRef.current.getBoundingClientRect().bottom > window.innerHeight) {
            window.addEventListener('scroll', waitUntilCardInPosition);
            window.scroll({
                top: targetPosition,
                behavior: 'smooth'
            });
        } else {
            showPopup();
        }

        return () => {
            window.removeEventListener('scroll', waitUntilCardInPosition);
        };
    }, []);

    return (
        <div ref={overlayRef} className="overlay hide">
            <div
                ref={popupRef}
                className="popup"
                style={{
                    top: `${positionTop}px`,
                    ...(options.left < document.body.clientWidth / 2 - 10) ? 
                    {left: '10px'} : {right: '10px'},
                }}
            >
                <div className="cardProduct">
                    <picture><img src={`data:image/jpeg;base64,${product["ProductPhoto"]}`} alt='' /></picture>
                    <h3>{product["ProductName"]}</h3>
                    <p>{product["ProductDescription"]}</p>
                </div>
                <Button product={product} locationCall={'menu'}/>
            </div>
        </div>
    );
}

export default Popup;