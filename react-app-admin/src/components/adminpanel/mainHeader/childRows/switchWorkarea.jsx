import { useMainContext } from "./../../../../context/mainContext.js";
import "./../../../../style/switchWorkarea.css";

const SwitchWorkarea = () => {
    const { SetView } = useMainContext();

    return (
        <div className="row switch-workarea">
            <button className="btn-switch-workarea" onClick={() => SetView(null)}>
                Сменить рабочую зону
            </button>
        </div>
    )
}

export default SwitchWorkarea;