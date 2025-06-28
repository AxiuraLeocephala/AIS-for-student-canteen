import { useState } from "react";
import "./../../../../style/product.css";

const Product = ({ product, setListChanged, listChanged, setIsShowWarning }) => {
    const [isStop, setIsStop] = useState(product["Stop"] === 1);
    const [maxQuantity, setMaxQuantity] = useState(product["MaxQuantity"]);
    const [stateChangedFildStop , setStateChangedFildStop] = useState(false);
    const [stateChangedFildMaxQuantity, setStateChangedMaxQuantity] = useState(false);

    const handleChange = (source, value) => {
        setIsShowWarning(false);
        if (source === "cheakBox") {
            if (isStop === (product["Stop"] === 1)) {
                let inListChanged = false;
                listChanged.forEach(productChanged => {
                    if (productChanged["ProductId"] === product["ProductId"]) inListChanged = true;
                })

                if (inListChanged) {
                    setListChanged(prevListChanged => {
                        return prevListChanged.map(prevProduct => {
                            if (prevProduct["ProductId"] === product["ProductId"]) {
                                return {
                                    "ProductId": prevProduct["ProductId"],
                                    "ProductName": prevProduct["ProductName"],
                                    "MaxQuantity": prevProduct["MaxQuantity"],
                                    "Stop": !isStop
                                }
                            }
                            return prevProduct
                        })
                    })
                } else {
                    setListChanged(prevListChanged => {
                        return [
                            ...prevListChanged,
                            {
                                "ProductId": product["ProductId"],
                                "ProductName": product["ProductName"],
                                "MaxQuantity": product["MaxQuantity"],
                                "Stop": !isStop
                            }
                        ]
                    })
                }
                setStateChangedFildStop(true)
            } else {
                if (stateChangedFildMaxQuantity) {
                    setListChanged(prevListChanged => {
                        return prevListChanged.map(prevProduct => {
                            if (prevProduct["ProductId"] === product["ProductId"]) {
                                return {
                                    "ProductId": prevProduct["ProductId"],
                                    "ProductName": prevProduct["ProductName"],
                                    "MaxQuantity": prevProduct["MaxQuantity"],
                                    "Stop": product["Stop"] === 1
                                }
                            }
                            return prevProduct
                        })
                    });
                } else {
                    setListChanged(prevListChanged => {
                        return prevListChanged.filter(prevProduct => prevProduct["ProductId"] !== product["ProductId"]);
                    })
                }
                setStateChangedFildStop(false);
            }
            setIsStop(prevState => !prevState);
        } else {
            if (parseInt(value, 10) === product["MaxQuantity"]) {
                if (stateChangedFildStop) {
                    setListChanged(prevListChanged => {
                        return prevListChanged.map(prevProduct => {
                            if (prevProduct["ProductId"] === product["ProductId"]) {
                                return {
                                    "ProductId": prevProduct["ProductId"],
                                    "ProductName": prevProduct["ProductName"],
                                    "MaxQuantity": product["MaxQuantity"],
                                    "Stop": prevProduct["Stop"]
                                }
                            }
                            return prevProduct;
                        })
                    })
                } else {
                    setListChanged(prevListChanged => {
                        return prevListChanged.filter(prevProduct => prevProduct["ProductId"] !== product["ProductId"]);
                    })
                }
                setStateChangedMaxQuantity(false);
            } else {
                let inListChanged = false;
                listChanged.forEach(productChanged => {
                    if (productChanged["ProductId"] === product["ProductId"]) inListChanged = true;
                })

                if (inListChanged) {
                    setListChanged(prevListChanged => {
                        return prevListChanged.map(prevProduct => {
                            if (prevProduct["ProductId"] === product["ProductId"]) {
                                return {
                                    "ProductId": prevProduct["ProductId"],
                                    "ProductName": prevProduct["ProductName"],
                                    "MaxQuantity": parseInt(value),
                                    "Stop": prevProduct["Stop"]
                                }
                            }
                            return prevProduct;
                        }) 
                    })
                } else {
                    setListChanged(prevListChanged => {
                        return [
                            ...prevListChanged,
                            {
                                "ProductId": product["ProductId"],
                                "ProductName": product["ProductName"],
                                "MaxQuantity": parseInt(value),
                                "Stop": product["Stop"] === 1
                            }
                        ]
                    })
                }
                setStateChangedMaxQuantity(true);
            }
            setMaxQuantity(value)
        }
    }

    return (
        <div className={isStop ? ("product stop"):("product")}>
            <input 
                className="btn-checkBox" 
                type="checkBox" 
                checked={isStop} 
                onChange={(e) => handleChange("cheakBox", e.target.value)}
            />
            <label className="nameProduct">{product["ProductName"]}</label>
            <input 
                className="maxQuantity"
                type="number" 
                value={maxQuantity}
                min="1"
                max="10"
                step="1"
                inputMode="numeric"
                pattern="\d+"
                onChange={(e) => handleChange("maxQuantity", e.target.value)}
            />
        </div>
    )
}

export default Product