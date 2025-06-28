import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import LP from "./loginPassword";
import QR from "./qrCode";
import ErrorElement from "../../error/ErrorElement.jsx";
import { CurrentTheme } from "./../../utils/theme.js"; 
import { setCookie } from "./../../utils/cookie.js";
import { User } from "../../utils/user.js";
import eye1 from './../../assets/images/eye1.svg';
import eye2 from './../../assets/images//eye2.svg';
import "./../../style/authenticate.css";

const Authenticate = () => {
    const webSocket = useRef();
    const [isOpenWS, setIsOpenWS] = useState(false);
    const [isShowLogin, setIsShowLogin] = useState(true);
    const [isShowQR, setIsShowQR] = useState(true)
    const [isVisiblePassword, setIsVisiblePassword] = useState(false)
    const [isShowError, setIsShowError] = useState();
    const [error, setError] = useState(false);
    const [qrToken, setQRToken] = useState();
    const [isUnvalidInput, setIsUnvalidInput] = useState(false);
    const currentTheme = CurrentTheme();
    const navigate = useNavigate();
    let pingInterval = 0;


    document.documentElement.setAttribute("data-theme", currentTheme);
    document.documentElement.setAttribute("user-agent", User.isMobile() ? ("phone"):("pc"));

    webSocket.current = new WebSocket("wss://meridian-admin.studentcanteen.ru/ws/admin-api/auth/admin/authenticate");

    webSocket.current.onmessage = e => {
        const data = JSON.parse(e.data)
        switch (data.contentType) {
            case "pong":
                break;
            case "link":
                setQRToken(data.link);
                setIsShowQR(true);
                break;
            case "2FA":
                if (data.stat === "") {
                    setIsShowQR(false);
                } else if (data.stat) {
                    webSocket.current.send(JSON.stringify({"contentType": "close"}))
                    setCookie("accessTokenAdmin", data.accessToken, {'max-age': 43200});
                    setCookie("refreshTokenAdmin", data.refreshToken, {'max-age': 43200});
                    setCookie('roleWorker', data.role, {'max-age': 43200});
                    navigate('/adminpanel', {state: {accessToken: data.accessToken}});
                } else {
                    if (data.error) {
                        setIsShowQR(true);
                        setError(data.error);
                        setIsShowError(true);
                        setTimeout(() => {
                            setIsShowError(false);
                        }, 7000);
                    } else {
                        setIsUnvalidInput(true);
                    }
                }
                break;
            case "LP":
                if (data.stat) {
                    webSocket.current.send(JSON.stringify({"contentType": "close"}))
                    setCookie("accessTokenAdmin", data.accessToken, {'max-age': 43200});
                    setCookie("refreshTokenAdmin", data.refreshToken, {'max-age': 43200});
                    setCookie('roleWorker', data.role, {'max-age': 43200});
                    navigate('/adminpanel', {state: {accessToken: data.accessToken}});
                } else {
                    setIsUnvalidInput(true)
                }
                break;
            case "error":
                setError(data.error);
                setIsShowError(true);
                setTimeout(() => {
                    setIsShowError(false);
                }, 7000);
                break;
            default:
                console.warning("unknow contentType");
                break;
        }
    }

    webSocket.current.onopen = e => {
        pingInterval = setInterval(() => {
            webSocket.current.send(JSON.stringify({"contentType": "ping"}))
        }, 60000);
        if (!isShowLogin) {
            webSocket.current.send(JSON.stringify({"contentType": "QR"}));
        }
        setIsOpenWS(true);
    }

    const handleClickOnToggle = (input) => {
        setIsVisiblePassword(prevState => !prevState);
        input.type = input.type === "password" ? ("text"):("password")
    }

    const handleClickOnSwitch = () => {
        setIsUnvalidInput(false);
        if (isShowLogin) {
            webSocket.current.send(JSON.stringify({"contentType": "QR"}));
        }
        setIsShowLogin(prevState => !prevState);
    }
    
    const onFocusInput = (label, input) => {
        label.style.color = currentTheme === "light" ? "#000000" : "#fff";
        label.style.top = `-${input.getBoundingClientRect().height / 2}px`;
    }

    const onBlurInput = (label, input) => {
        if (input.value === "") {
            label.style.color = "#9e9e9e";
            label.style.top = 0;
        }
    }

    if (isOpenWS) {
        return (
            <>
                {isShowLogin ? (
                    <LP 
                        handleClickOnSwitch={handleClickOnSwitch} 
                        handleClickOnToggle={handleClickOnToggle} 
                        webSocket={webSocket} 
                        isVisiblePassword={isVisiblePassword}
                        eye1={eye1}
                        eye2={eye2}
                        setIsUnvalidInput={setIsUnvalidInput}
                        isUnvalidInput={isUnvalidInput}
                        onFocusInput={onFocusInput}
                        onBlurInput={onBlurInput}
                    /> 
                ):(
                    <QR
                        isShowQR={isShowQR}
                        qrToken={qrToken}
                        handleClickOnSwitch={handleClickOnSwitch} 
                        handleClickOnToggle={handleClickOnToggle} 
                        webSocket={webSocket} 
                        isVisiblePassword={isVisiblePassword}
                        eye1={eye1}
                        eye2={eye2}
                        setIsUnvalidInput={setIsUnvalidInput}
                        isUnvalidInput={isUnvalidInput}
                        onFocusInput={onFocusInput}
                        onBlurInput={onBlurInput}
                    />
                )}
                {isShowError && (<ErrorElement error={error}/>)}
            </>
        )
    }
}

export default Authenticate;