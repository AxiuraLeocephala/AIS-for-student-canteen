import { useMainContext } from "./../../../../context/mainContext.js";
import "./../../../../style/switchReceive.css";

const SwitchReceive = () => {
    const { webSocket, stateCreationOrders } = useMainContext();

    const handleClickSwitch = () => {
        webSocket.send(JSON.stringify({
            "contentType": "changeStateCreationOrders",
        }))
    }

    return (
        <div className="row switch-receive">
            Создавание новых заказов
            <div className={`switch-wrapper ${stateCreationOrders ? "on":"off"}`} onClick={handleClickSwitch}>
                <div className='switch'></div>
            </div>
        </div>
    )
}

export default SwitchReceive;