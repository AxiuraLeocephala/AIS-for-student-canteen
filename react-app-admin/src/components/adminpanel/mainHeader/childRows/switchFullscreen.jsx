import { useState } from "react"

import "./../../../../style/switchFullscreen.css"

const SwitchFullsreen = () => {
    const [isFullsreen, setIsFullsreen] = useState(false);

    const handleClickSwitch = () => {
        const isFullscreenAPI = document.fullscreenElement || document.webkitFullscreenElement;

        if (isFullscreenAPI) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        } else {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            }
        }

        setIsFullsreen(prevState => !prevState);
    }

    return (
        <div className="row switch-fullscreen">
            Полноэкранный режим
            <div className={`switch-wrapper ${isFullsreen ? "on":"off"}`} onClick={handleClickSwitch}>
                <div className='switch'></div>
            </div>
        </div>
    )
}

export default SwitchFullsreen