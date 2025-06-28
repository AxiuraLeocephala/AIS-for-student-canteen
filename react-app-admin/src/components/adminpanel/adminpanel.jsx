import { useState, useEffect, useRef } from "react";
import { useLoaderData } from "react-router-dom";

import { useMainContext } from "./../../context/mainContext.js";
import { setCookie } from "./../../utils/cookie.js";
import OrderConfirm from './confirmation/orderConfirmation.jsx';
import OrderAssembly from "./assembly/orderAssembly.jsx";
import OrderADelivery from "./aDelivery/orderADelivery.jsx";
import ErrorElement from "./../../error/ErrorElement.jsx";

import "./../../style/adminpanel.css";
import "./../../style/commonOrder.css";

const AdminPanel = () => {
    const webSocket = useRef();
    const { accessTokenAdmin } = useLoaderData();
    const [listOrders, setListOrders] = useState({oConfirmation: [], oAssembly: [], ADelivery: []});
    const [isShowError, setIsShowError] = useState(false);
    const [error, setError] = useState(false);
    const { 
        setWebSocket, SetVisibilityState, SetArrayWorkers, 
        AddNewWorker, SetLoginPassword, SetStateLoading,
        view, SetPriceList, UpdatePriceList, SetCreationOrders,
        SetErrMsgADeliveryPopup, SetTargetOrderADeliveryPopup, SetErrMsgShowADeliveryPopup, 
        setVisibilityState, setShutdownTime
    } = useMainContext();
    let pingInterval = 0;

    useEffect(() => {
        webSocket.current = new WebSocket(`wss://meridian-admin.studentcanteen.ru/ws/adminpanel-api/adminpanel?accessToken=${accessTokenAdmin}`);
        setWebSocket(webSocket.current);

        webSocket.current.onopen = () => {
            webSocket.current.send(JSON.stringify({"contentType": "open"}));
            pingInterval = setInterval(() => {
                webSocket.current.send(JSON.stringify({"contentType": "ping"}))
            }, 60000);
        }

        webSocket.current.onmessage = e => {
            const req = JSON.parse(e.data);
            switch (req.contentType) {
                case "pong":
                    break;
                case "listOrders":
                    setListOrders({oConfirmation: req.oConfirmation, oAssembly: req.oAssembly, ADelivery: req.ADelivery});
                    SetCreationOrders(req.stateCreatinonOrder);
                    setCookie(req.role);
                    setShutdownTime(req.shutdownTime)
                    break;
                case "newOrder":
                    setListOrders(prevListOrders => {
                        const updateConfirmation = [
                            ...prevListOrders.oConfirmation,
                            req.data
                        ]
                        
                        return{
                            ...prevListOrders,
                            oConfirmation: updateConfirmation
                        }
                    })
                    break
                case "removeNewOrder":
                    setListOrders(prevListOrders => {
                        const updateConfirmation = prevListOrders.filter(order => (
                            order['OrderId'] !== req.data.OrderId && order['UserId'] !== req.data.UserId
                        ))
                        
                        return {
                            ...prevListOrders,
                            oConfirmation: updateConfirmation
                        }
                    })
                    break
                case "rejectAcceptOrder":
                    if (req.data.action === "reject") {
                        setListOrders(prevListOrders => {
                            const updateConfirmation = prevListOrders.oConfirmation.filter(order => {
                                if (order["OrderId"] === req.data.orderId && order["UserId"] === req.data.userId) {
                                    return false;
                                }
                                return true;
                            })
        
                            return {
                                ...prevListOrders,
                                oConfirmation: updateConfirmation
                            }
                        })
                    } else if (req.data.action === "accept") {
                        setListOrders(prevListOrders => {
                            const updateConfirmation = prevListOrders.oConfirmation.filter(order => {
                                if (order["OrderId"] === req.data.orderId && order["UserId"] === req.data.userId) {
                                    return false;
                                }
                                return true;
                            })
        
                            const updateAssembly = [
                                ...prevListOrders.oAssembly,
                                ...prevListOrders.oConfirmation.filter(order => 
                                    order["OrderId"] === req.data.orderId && order["UserId"] === req.data.userId
                                ).map(order =>({
                                    ...order,
                                    Status: "assembly"
                                }))
                            ]
                        
                            return {
                                ...prevListOrders,
                                oConfirmation: updateConfirmation,
                                oAssembly: updateAssembly
                            };
                        });
                    };
                    break;
                case "completedOrder":
                    setListOrders(prevListOrders => {
                        const updateAssembly = prevListOrders.oAssembly.filter(order => 
                            !(order["OrderId"] === req.data.orderId && order["UserId"] === req.data.userId)
                        );
        
                        const updateADelivery = [
                            ...prevListOrders.ADelivery,
                            ...prevListOrders.oAssembly.filter(order => 
                                order["OrderId"] === req.data.orderId && order["UserId"] === req.data.userId 
                            ).map(order => ({
                                ...order,
                                Status: "Adelivery"
                            }))
                        ];
                        
                        return {
                            ...prevListOrders,
                            oAssembly: updateAssembly,
                            ADelivery: updateADelivery
                        };
                    })
                    break;
                case "checkCodeReceive":
                    if (req.codeCorrect) {
                        setTimeout(() => {
                            SetErrMsgShowADeliveryPopup(false);
                            SetTargetOrderADeliveryPopup(document.getElementById(req.orderId));
                            SetVisibilityState(req.orderId, true);
                        }, 50)
                    } else {
                        SetErrMsgADeliveryPopup(`${req.errorMessage}`);
                        SetErrMsgShowADeliveryPopup(true);
                    }
                    break;
                case "orderIssued":
                    setListOrders(prevListOrders => {
                        const updateADelivery = prevListOrders.ADelivery.filter(order => {
                            if (order["OrderId"] === req.data.orderId && order["UserId"] === req.data.userId) {
                                return false;
                            }
                            return true;
                        })
        
                        return {
                            ...prevListOrders,
                            ADelivery: updateADelivery
                        }
                    })
                    setVisibilityState(prevState => {
                        delete prevState[req.data.orderId]
                        return prevState;
                    })
                    break;
                case "changeStateCreationOrders":
                    SetCreationOrders(req.data.newStateCreationOrders);
                    break;
                case "changeShutdownTime":
                    setShutdownTime(req.data.shutdownTime);
                    break;
                case "getWorkers":
                    SetArrayWorkers(req.admins);
                    break;
                case "addWorker":
                    AddNewWorker(req.newWorker);
                    SetLoginPassword(req.login, req.password)
                    break;
                case "changeWorker":
                    SetArrayWorkers(prevArrayWorkers => {
                        const updateArrayWorkers = prevArrayWorkers.map(worker => {
                            if (worker["Worker_Id"] === req.updateWorker.Worker_Id) return req.updateWorker
                            return worker
                        })

                        return updateArrayWorkers
                    })
                    SetStateLoading()
                    break;
                case "removeWorker":
                    SetArrayWorkers(prevArrayWorkers => {
                        const updateArrayWorkers = prevArrayWorkers.filter(worker => (
                            worker["Worker_Id"] !== req.id
                        ))
                        
                        return updateArrayWorkers
                    })
                    break
                case "getPriceList":
                    SetPriceList(req.priceList)
                    break;
                case "updatePriceList":
                    UpdatePriceList(req.updatePriceList);
                    break;
                case "error":
                    setError(req.errorMsg);
                    setIsShowError(true);
                    setTimeout(() => {
                        setIsShowError(false);
                    }, 7000);
                    break;
                default:
                    console.warning("unknow contentType");
                    break;
            }
        }

        webSocket.current.onerror = e => {
            console.error(e);
        }

        webSocket.current.onclose = () => {
            webSocket.current.onopen = webSocket.current.onmessage = webSocket.current.onerror = webSocket.current.onclose = null;
            clearInterval(pingInterval);
        }

        return () => {
            webSocket.current.close();
        };
    }, [])

    return (
        <div  className="main">
            {["Confirm", "GeneralView"].includes(view) && (
                <OrderConfirm listOrders={listOrders}/>
            )}
            {["Assembly", "GeneralView"].includes(view) && (
                <OrderAssembly listOrders={listOrders}/>
            )}
            {["ADelivery", "GeneralView"].includes(view) && (
                <OrderADelivery listOrders={listOrders}/>
            )}
            {isShowError && (
                <ErrorElement error={error}/>
            )}
        </div>
    )
}

export default AdminPanel;