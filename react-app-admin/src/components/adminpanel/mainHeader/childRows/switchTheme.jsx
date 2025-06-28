import { useState } from "react";

import { useMainContext } from "./../../../../context/mainContext.js"
import { CurrentTheme } from "./../../../../utils/theme.js";
import { setCookie } from "./../../../../utils/cookie";
import "./../../../../style/switchTheme.css";

const SwitchTheme = () => {
    const { currentTheme, setCurrentTheme } = useMainContext();

    const handleClickSwitch = () => {
        const theme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", theme);
        setCookie("theme", theme);
        setCurrentTheme(theme);
    }

    return (
        <div className="row switch-theme">
            Светлая тема 
            <div className={`switch-wrapper ${currentTheme === "dark" ? "off":"on"}`} onClick={handleClickSwitch}>
                <div className='switch'></div>
            </div>
        </div>
    )
}

export default SwitchTheme