import React, {createContext, useContext, useState, useRef} from "react";

const VisibilityContext = createContext();

export const useVisibility = () => useContext(VisibilityContext);

export const VisibilityProvider = ({ children }) => {
    const [visibilityState, setVisibilityState] = useState("hidden");
    const [quantity, setQuantity] = useState(1);
    const timerRef = useRef(0);
    
    const setComponentVisibility = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        setVisibilityState("visible");
        timerRef.current = setTimeout(() => {
            setVisibilityState("hidden");
        }, 4000)
    };
    const setComponentQuantity = (quantity) => {
        setQuantity(quantity);
    };


    return (
        <VisibilityContext.Provider value={{visibilityState, setComponentVisibility, quantity, setComponentQuantity}}>
            {children}
        </VisibilityContext.Provider>
    )
}