import { useRef, useEffect } from "react";
import { QRCode } from "react-qrcode-logo";

import { CurrentTheme } from "./../../utils/theme"
import PasswordSVGBlack from "./../../assets/images/Password-black.svg";
import PasswordSVGWhite from "./../../assets/images/Password-white.svg";
import "./../../style/qrCode.css";

const QR = ({
    isShowQR, qrToken, handleClickOnSwitch, 
    handleClickOnToggle, webSocket, isVisiblePassword, 
    eye1, eye2, setIsUnvalidInput, 
    isUnvalidInput, onFocusInput, onBlurInput
}) => {
    const inputRef = useRef();
    const labelRef = useRef()
    const bgPrimary = getComputedStyle(document.documentElement).getPropertyValue('--background');
    const colPrimary = getComputedStyle(document.documentElement).getPropertyValue('--on-surface');
    const passwordSVG = CurrentTheme() === "dark" ? (PasswordSVGWhite):(PasswordSVGBlack);

    const handleClickBtn = (input) => {
        if (input.value === "") {
            input.classList.add("unvalid")
        } else {
            webSocket.current.send(JSON.stringify({
                "contentType": "2FA", 
                "code": input.value
            }));
        }
    }

    useEffect(() => {
        if (isUnvalidInput) {
            inputRef.current.addEventListener('input', () => {
                setIsUnvalidInput(false);
            })
        }
    }, [isUnvalidInput])

    return (
        <div className="card">
            {isShowQR ? (
                <>
                    {QR && (
                        <>
                            <div className="switch-wrapper">
                                <img src={passwordSVG} className="switch to-login" onClick={handleClickOnSwitch} alt=""/>
                            </div>
                            <div className="qr">
                                <QRCode
                                    value={qrToken}
                                    size={200}
                                    eyeRadius={[
                                        {
                                            outer: [10, 10, 10, 10],
                                            inner: [3, 3, 3, 3]
                                        },
                                        {
                                            outer: [10, 10, 10, 10],
                                            inner: [3, 3, 3, 3]
                                        },
                                        {
                                            outer: [10, 10, 10, 10],
                                            inner: [3, 3, 3, 3]
                                        }
                                    ]}
                                    
                                    fgColor={colPrimary}
                                    bgColor={bgPrimary}
                                    qrStyle="dots"
                                />
                            </div>
                            <h4 className="h4-qr">Вход по QR-коду</h4>
                            <ol className="description">
                                <li>Откройте телеграм с телефона.</li>
                                <li>
                                    <span>
                                        Откройте <b>Настройки</b> {'>'} <b>Устройства</b> {'>'} <b>Подключить устройство</b>.
                                    </span>
                                </li>
                                <li>Для подтверждения направьте камеру телефона на этот экран.</li>
                            </ol>
                        </>
                    )}
                </>
            ):(
                <> 
                    <h4>Введите ваш пароль<br />для двухфакторной аутентификации</h4>
                    <div className="description">
                        Ваш аккаунт защищен дополнительным паролем
                    </div>
                    <div className="input-wrapper">
                        <div className="input-field">
                            <input 
                                ref={inputRef}
                                type="password" 
                                autoComplete="off"
                                required 
                                readOnly
                                className={isUnvalidInput ? ("input-field-input unvalid"):("input-field-input")}
                                onFocus={() => onFocusInput(labelRef.current, inputRef.current)}
                                onBlur={() => onBlurInput(labelRef.current, inputRef.current)}
                                onChange={(e) => {
                                    e.target.classList.remove("unvalid")
                                }}
                            />
                            <div className="input-field-border"></div>
                            <label ref={labelRef}>
                                <span className="i18n">Пароль</span>
                            </label>
                            <span className="toggle-visible" onClick={() => handleClickOnToggle(inputRef.current)}>
                                <span className="tgicon">
                                    <img src={isVisiblePassword ? (eye2):(eye1)} alt=""/>
                                </span>
                            </span>
                        </div>
                        <button className="btn" onClick={() => handleClickBtn(inputRef.current)}>
                            <span className="btn-text">Продолжить</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

export default QR;