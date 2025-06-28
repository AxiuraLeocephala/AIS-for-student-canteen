import { CurrentTheme } from "./../utils/theme";
import warningDark from "./../assets/images/warning-dark.svg";
import warningWhite from "./../assets/images/warning-white.svg";
import './../style/ErrorElement.css'

const ErrorElement = ({ error }) => {
    const warning = CurrentTheme() === "dark" ? (warningDark):(warningWhite)

    if (error) {
        return (
            <div className="error-container">
                <div className="img-container">
                    <img src={warning} alt="" />
                </div>
                <div className="error-msg-container">
                    <div className="title">Внимание !</div>
                    <div className="msg">{error}</div>
                </div>
            </div>
        )
    }
}

export default ErrorElement;