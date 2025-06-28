import React from 'react';
import {tg} from "./../hooks/useTelegram"
import './../styles/preloader.css';

const Preloader = () => {
    tg.MainButton.hide();
    tg.BackButton.hide();

    return (
        <div className="preloader">
            <div className="sk-chase">
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
            </div>
        </div>
    );
};

export default Preloader;