import { useEffect, useRef, useState} from "react";
import { useMainContext } from "./../../../context/mainContext.js"
import "./../../../style/popupCheckCodeReceive.css";

const PopupCheckCodeReceive = ({ activePopup, columnRef }) => {
    const overlayRef = useRef(null);
    const inputRef = useRef(null);
    const [positionOverlay, setPositionOverlay] = useState(null);
    const { 
        webSocket, SetErrMsgShowADeliveryPopup, errMsgShowADeliveryPopup,
        SetErrMsgADeliveryPopup, errMsgADeliveryPopup, 
    } = useMainContext();

    const handleClickOverlay = (e) => {
        if (e.target.closest('.popupCheckCodeReceive') === null) {
            overlayRef.current.classList.add('hide');
            columnRef.current.style.overflow = "";
            setTimeout(() => activePopup(), 50)
            overlayRef.current.removeEventListener('click', handleClickOverlay);
        }
    };

    const handleClickBtn = () => {
        inputRef.current.blur()

        const value = inputRef.current.value;

        if (!value) {
            SetErrMsgADeliveryPopup("Введите код для получения заказа");
            SetErrMsgShowADeliveryPopup(true);
            return;
        }

        if (value.length !== 5) {
            SetErrMsgADeliveryPopup("Код должен состоять из пяти символов");
            SetErrMsgShowADeliveryPopup(true);
            return;
        }

        if (!/[а-яА-Я][0-9]{4}$/i.test(value)) {
            SetErrMsgADeliveryPopup("Код должен начинаться с кириллической буквы и содержать четыре цифры");
            SetErrMsgShowADeliveryPopup(true);
            return;
        }

        webSocket.send(JSON.stringify({
            "contentType": "checkCodeReceive",
            "codeReceive": value.toUpperCase()
        }))
    }
    
    useEffect(() => {
        setPositionOverlay(columnRef.current.scrollTop);
        columnRef.current.style.overflow = "hidden";
        setTimeout(() => {overlayRef.current.classList.remove('hide')}, 50) 
        setTimeout(() => {
            inputRef.current.focus();
            overlayRef.current.addEventListener('click', handleClickOverlay);
        }, 150);
    }, []);

    return (
        <div ref={overlayRef} className="overlay hide" style={{top: `${positionOverlay}px`}}>
            <div className="popupCheckCodeReceive">
                <h4>Введите код для получения</h4>
                <div className="input-wrapper">
                    <input type="text" ref={inputRef} onChange={() => {SetErrMsgShowADeliveryPopup(false)}}/>
                    {errMsgShowADeliveryPopup && (<div className="error-msg">{errMsgADeliveryPopup}</div>)}
                    <button onClick={handleClickBtn}>Проверить</button>
                </div>
            </div>
        </div>
    )
}

export default PopupCheckCodeReceive;