import { useRouteError } from "react-router-dom";
import niceWorkBro from "../assets/images/niceWorkBro.gif";
import thinkingFace from "../assets/images/thinkingFace.gif";
import slepping from '../assets/images/slepping.gif';
import "../styles/errorPage.css";

const ErrorPage = () => {
    const error = useRouteError();

    let logo;
    switch (error.status) {
        case 401:
            logo = niceWorkBro;
            break;
        case 503:
            logo = slepping;
            break;
        default:
            logo = thinkingFace;
            break;
    }

    return (  
        <div>
            <section className="errorPage">
                <img src={logo} alt=""/>
                <p className="first">Что-то пошло не так</p>
                <p className="last">
                    <i>{error.statusText || error.message || error.data}</i>
                </p>
            </section>
        </div> 
    )
}

export default ErrorPage;