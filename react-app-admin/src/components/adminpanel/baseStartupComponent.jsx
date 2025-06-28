import { useEffect, useRef } from "react";

import { MainProvider, useMainContext } from "./../../context/mainContext.js";
import { ScheduleRefreshTokens, CancelRefreshTokens } from "./../../utils/updateTokens.js";
import { CurrentTheme } from "./../../utils/theme.js";
import { User } from "./../../utils/user.js";
import SelectWorkspace from "./selectWorkspace.jsx";

const BaseStartupComponent = () => {
    const timerRef = useRef();


    useEffect(() => {
        document.documentElement.setAttribute("data-theme", CurrentTheme());
        document.documentElement.setAttribute("user-agent", User.isMobile() ? ("phone"):("pc"));
        
        ScheduleRefreshTokens(timerRef)

        return () => {
            CancelRefreshTokens(timerRef)
        }
    }, []);

    return (
        <MainProvider>
            <SelectWorkspace/>
        </MainProvider>
    )
}

export default BaseStartupComponent; 