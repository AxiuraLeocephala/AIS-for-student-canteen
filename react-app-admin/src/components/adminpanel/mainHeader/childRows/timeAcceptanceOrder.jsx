import { useState, useRef, useEffect } from "react";
import { useMainContext } from "./../../../../context/mainContext.js";
import "./../../../../style/timeAcceptanceOrder.css";

const TimeAcceptanceOrder = () => {
    const { shutdownTime, webSocket } = useMainContext();
    const hour = shutdownTime.substring(0, 2);
    const minutes = shutdownTime.substring(3, 5);
    const [shutdownHour, setShutdownHour] = useState(hour);
    const [shutdownMinutes, setShutdownMinutes] = useState(minutes);
    const [isShowButton, setIsShowButton] = useState(false);
    const [isUnvalidInput1, setIsUnvalidInput1] = useState(false);
    const [isUnvalidInput2, setIsUnvalidInput2] = useState(false);
    const inputRef1 = useRef();
    const inputRef2 = useRef();
    
    const handleClickButton = () => {
        let hourValid = false;
        let minutesValid = false;

        if (inputRef1.current.value.length > 0) {
            if (inputRef1.current.value.length === 1) {
                if (
                    parseInt(inputRef1.current.value) < 8 || 
                    (parseInt(inputRef1.current.value) === 8 && parseInt(inputRef2.current.value) === 0)
                ) {
                    setIsUnvalidInput1(true);
                } else {
                    hourValid = true;
                }
            } else {
                if (inputRef1.current.value[0] === "0") {
                    if (
                        inputRef1.current.value[1] > 8 || 
                        (parseInt(inputRef1.current.value[1]) === 8 && parseInt(inputRef2.current.value) > 0)
                    ) {
                        setShutdownHour(inputRef1.current.value[1]);
                        hourValid = true;
                    } else {
                        setIsUnvalidInput1(true);
                    }
                } else if (parseInt(inputRef1.current.value[0]) >= 2 && parseInt(inputRef1.current.value[1]) >= 4) {
                    setIsUnvalidInput1(true);
                } else {
                    hourValid = true;
                }
            }
        } else {
            setIsUnvalidInput1(true);
        }

        if (inputRef2.current.value.length > 0) {
            if (inputRef2.current.value.length === 1) {
                setShutdownMinutes("0" + inputRef2.current.value[0]);
                minutesValid = true;
            } else {
                if (parseInt(inputRef2.current.value[0]) < 6) {
                    minutesValid = true;
                } else {
                    setIsUnvalidInput2(true);
                }
            }
        } else {
            setIsUnvalidInput2(true)
        }

        if (hourValid && minutesValid) {
            webSocket.send(JSON.stringify({
                "contentType": "changeShutdownTime",
                "oldTime": shutdownTime, 
                "newTime": shutdownHour + ":" + shutdownMinutes + ":00"
            }))
        }
    }

    useEffect(() => {
        setIsShowButton(false);
    }, [hour, minutes])

    return (
        <div className="row time-acceptance-order">
            Время приемы заказов (до)
            <div className="time">
                {isShowButton && (
                    <button onClick={handleClickButton}>Сохранить</button>
                )}
                <input 
                    ref={inputRef1}
                    className={isUnvalidInput1 ? ("unvalid"): ("")}
                    type="text"
                    placeholder="00"
                    onFocus={(e) => {e.target.placeholder = ""; setIsUnvalidInput1(false); setIsUnvalidInput2(false)}} 
                    onBlur={(e) => e.target.placeholder = "00"}
                    value={shutdownHour}
                    onChange={(e) => {
                        if (/^\d{0,2}$/.test(e.target.value)) {
                            setShutdownHour(e.target.value);
                            if (e.target.value !== hour) {
                                setIsShowButton(true);
                            } else if (shutdownMinutes === minutes) {
                                setIsShowButton(false);
                            }
                        }
                    }}
                />
                <div className="colon">:</div>
                <input 
                    ref={inputRef2}
                    className={isUnvalidInput2 ? ("unvalid"): ("")}
                    type="number" 
                    placeholder="00"
                    onFocus={(e) => {e.target.placeholder = ""; setIsUnvalidInput2(false); setIsUnvalidInput1(false)}} 
                    onBlur={(e) => e.target.placeholder = "00"}
                    value={shutdownMinutes}
                    onChange={(e) => {
                        if (/^\d{0,2}$/.test(e.target.value)) {
                            setShutdownMinutes(e.target.value)
                            if (e.target.value !== hour) {
                                setIsShowButton(true)
                            } else if (shutdownHour === hour) {
                                setIsShowButton(false)
                            }
                        }
                    }}
                />
            </div>
        </div>
    )
}

export default TimeAcceptanceOrder