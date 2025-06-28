import { useEffect } from "react";

import { useMainContext } from "./../../context/mainContext.js";
import { CurrentTheme } from "./../../utils/theme.js";
import { User } from "./../../utils/user.js";
import AdminPanel from "./adminpanel.jsx";
import "./../../style/selectWorkspace.css";

const SelectWorkspace = () => {
    const { view, SetView, setCurrentTheme } = useMainContext();

    useEffect(() => {
        setCurrentTheme(CurrentTheme());
    }, [])

    if (!view) {
        return (
            <div className="select-workspace">
                <h4>выберите рабочую зону</h4>
                <div className="btn-space">
                    <button onClick={() => SetView("Confirm")}>принятие заказов</button>
                    <button onClick={() => SetView("Assembly")}>сборка заказов</button>
                    <button onClick={() => SetView("ADelivery")}>выдача заказов</button>
                    {!User.isMobile() && <button onClick={() => SetView("GeneralView")}>общий вид</button>}
                </div>
            </div>
        )
    } else {
        return (
            <AdminPanel/>
        )
    }
}

export default SelectWorkspace