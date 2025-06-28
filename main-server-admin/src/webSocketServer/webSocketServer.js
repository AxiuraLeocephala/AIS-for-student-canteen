import { WebSocketServer } from 'ws';
import url from 'url';

import dbService from '../services/dbService.js';
import queueWorkers from '../structuresData/queueWorkers.js';
import queueMessages from '../structuresData/queueMessages.js';
import VerifyToken from '../utils/verifyJWTToken.js';
import mspco from '../utils/MSPCO.js';
import sagaCoordinator from '../services/_sagaCoordinator.js';
import GenLogin from '../utils/genLogin.js';
import GenPassword from '../utils/genPassword.js';
import VerifyFormData from "../utils/verifyFormData.js";

function setupWebSocketServer(server) {
    const wss = new WebSocketServer({server: server, path: "/ws/adminpanel"})

    wss.on('connection', async (ws, req) => {
        const accessToken = url.parse(req.url, true).query.accessToken;
        const jwt = await VerifyToken(accessToken);
        if (!jwt) ws.close();
        queueWorkers.addWS(accessToken, ws);
        
        ws.on('message', async(message) => {
            const parsedMessage = JSON.parse(message);
            switch (parsedMessage.contentType) {
                case "open":
                    try {
                        const orders = await dbService.getOrders(`OrderId, UserId, Products, PaymentMethod, Status`, ``);
                        const role = await dbService.getWorkers(`Role`, `WHERE Worker_Id = ${jwt.user.id} AND SecondName = "${jwt.user.second_name}"`);

                        ws.send(JSON.stringify({
                            "contentType": "listOrders",
                            "oConfirmation": orders.filter(order => order.Status === 'confirmation'),
                            "oAssembly": orders.filter(order => order.Status === 'assembly'),
                            "ADelivery": orders.filter(order => order.Status === 'awaitingDelivery'),
                            "stateCreatinonOrder": mspco.params["StateCreationOrders"],
                            "role": role,
                            "shutdownTime": mspco.params["ShutdownTime"]
                        }))
                    } catch (error) {
                        console.error("ws.js:48", error);
                        ws.send(JSON.stringify({
                            "contentType": "error",
                            "errorMsg": "Ошибка сервера при получении информации о заказах" 
                        }));
                    }
                    break;
                case "ping":
                    ws.send(JSON.stringify({
                        "contentType": "pong"
                    }))
                    break;
                case "rejectAcceptOrder":
                    switch (parsedMessage.action) {
                        case "accept":
                            try {
                                await sagaCoordinator.acceptOrder(parsedMessage.orderId, parsedMessage.userId);
                                queueMessages.enqueue({
                                    "contentType": "rejectAcceptOrder",
                                    "info": {
                                        "action": "accept",
                                        "orderId": parsedMessage.orderId,
                                        "userId": parsedMessage.userId
                                    }
                                })
                            } catch (error) {
                                console.error("Error: ws.js:70", error);
                                ws.send(JSON.stringify({
                                    "contentType": "error",
                                    "errorMsg": "Ошибка сервера при принятии заказа"
                                }));
                            }
                            break;
                        case "reject":
                            try {
                                await sagaCoordinator.moveOrderHistory(parsedMessage.orderId, parsedMessage.userId, "отклонен");
                                queueMessages.enqueue({
                                    "contentType": "rejectAcceptOrder",
                                    "info": {
                                        "action": "reject",
                                        "orderId": parsedMessage.orderId,
                                        "userId": parsedMessage.userId
                                    }
                                })
                            } catch (error) {
                                console.error("Error ws.js:151:", error);
                                ws.send(JSON.stringify({
                                    "contentType": "error",
                                    "errorMsg": "Ошибка сервера при отклонении заказа"
                                }));
                            }
                            break;
                    }
                    break;
                case "completedOrder":
                    try {
                        await sagaCoordinator.completeOrder(parsedMessage.orderId, parsedMessage.userId);
                        queueMessages.enqueue({
                            "contentType": "completedOrder",
                            "info": {
                                "orderId": parsedMessage.orderId,
                                "userId": parsedMessage.userId
                            }
                        })
                    } catch (error) {
                        console.error("Error ws.js:191:", error);
                        ws.send(JSON.stringify({
                            "contentType": "error",
                            "errorMsg": "Ошибка сервера при подтверждении сбоки заказа"
                        }));
                    }
                    break;
                case "checkCodeReceive":
                    try {
                        const [order] = await dbService.getOrders(
                            `OrderId, UserId, Status`, 
                            `WHERE CodeReceive="${parsedMessage.codeReceive}"`
                        )

                        if (order && order["Status"] === "awaitingDelivery") {
                            ws.send(JSON.stringify({
                                "contentType": "checkCodeReceive",
                                "orderId": order["OrderId"],
                                "userId": order["UserId"],
                                "codeCorrect": true
                            }))
                        } else {
                            ws.send(JSON.stringify({
                                "contentType": "checkCodeReceive",
                                "codeCorrect": false,
                                "errorMessage": "Код не действителен"
                            }))
                        }
                    } catch (err) {
                        console.error("Error: ws.js:218", err);
                        ws.send(JSON.stringify({
                            "contentType": "error",
                            "errorMsg": "Ошибка сервера при проверке кода для получения"
                        }));
                    }
                    break;      
                case "orderIssued":
                    try {
                        await sagaCoordinator.moveOrderHistory(parsedMessage.orderId, parsedMessage.userId, "выдан");
                        queueMessages.enqueue({
                            "contentType": "orderIssued",
                            "info": {
                                "orderId": parsedMessage.orderId,
                                "userId": parsedMessage.userId
                            }
                        })
                    } catch (err) {
                        console.error("Error: ws.js:272", err);
                        ws.send(JSON.stringify({
                            "contentType": "error",
                            "errorMsg": "Ошибка сервера при подтвержении выдачи заказа"
                        }));
                    }
                    break;
                case "changeStateCreationOrders":
                    try {
                        await sagaCoordinator.changeStateCreationOrders();
                    } catch (error) {
                        console.error("Error: ws.js:316", error);
                        ws.send(JSON.stringify({
                            "contentType": "error",
                            "errorMsg": "Ошибка сервера при изменении статуса «Создание новых заказов»"
                        }));
                    }
                    break;
                case "changeShutdownTime":
                    try {
                        await sagaCoordinator.changeShutdownTime(parsedMessage.newTime, parsedMessage.oldTime);
                        queueMessages.enqueue({
                            "contentType": "changeShutdownTime",
                            "info": {
                                "shutdownTime": parsedMessage.newTime
                            }
                        })
                    } catch (error) {
                        console.error("Error: ws.js:316", error);
                        ws.send(JSON.stringify({
                            "contentType": "error",
                            "errorMsg": "Ошибка сервера при изменении времени приема заказов (до)"
                        }));
                    }
                    break;
                case "getWorkers":
                    try {
                        const workers = await dbService.getWorkers(
                            `Worker_Id, FirstName, SecondName, Role, PhoneNumber`,
                            ``
                        )
                        ws.send(JSON.stringify({
                            "contentType": "getWorkers",
                            "admins": workers
                        }))
                    } catch (error) {
                        console.error("Error: ws.js:348", error);
                        ws.send(JSON.stringify({
                            "contentType": "error",
                            "errorMsg": "Ошибка сервера при получении информации о сотрудниках"
                        }));
                    }
                    break;
                case "addWorker":
                    try {
                        const firstName = parsedMessage.firstName.toString();
                        const secondName = parsedMessage.secondName.toString();
                        const role = parsedMessage.role.toString();
                        const phoneNumber = parsedMessage.phoneNumber.toString();

                        await VerifyFormData(firstName, secondName, role, phoneNumber);

                        const [login, password] = await Promise.all([
                            GenLogin(),
                            GenPassword()
                        ])

                        await dbService.setWorkers(
                            `FirstName, SecondName, Role, PhoneNumber, Login, Password`,
                            `${firstName}, ${secondName}, ${role}, ${phoneNumber}, ${login}, ${password}`
                        )
                        
                        const worker = await dbService.getWorkers(`Worker_Id`, `WHERE Login = "${login}"`)

                        ws.send(JSON.stringify({
                            "contentType": "addWorker",
                            "newWorker": {
                                "Worker_Id": worker.Worker_Id,
                                "FirstName": firstName,
                                "SecondName": secondName,
                                "Role": role,
                                "PhoneNumber": phoneNumber
                            },
                            "login": login,
                            "password": password             
                        }))

                    } catch (error) {
                        console.error("Error: ws.js:348", error);
                        ws.send(JSON.stringify({
                            "contentType": "error",
                            "errorMsg": "Ошибка сервера при добавлении нового сотрудника"
                        }));
                    }
                    break;
                case "changeWorker":
                    try {
                        await VerifyFormData(
                            parsedMessage.newInfo.firstName, 
                            parsedMessage.newInfo.secondName, 
                            parsedMessage.newInfo.role, 
                            parsedMessage.newInfo.phoneNumber
                        )

                        await dbService.updateWorkers(
                            `FirstName='${parsedMessage.newInfo.firstName}', 
                            SecondName='${parsedMessage.newInfo.secondName}', 
                            Role='${parsedMessage.newInfo.role}', 
                            PhoneNumber='${parsedMessage.newInfo.phoneNumber}'`,
                            `WHERE Worker_Id=${parsedMessage.workerId}`
                        )

                        ws.send(JSON.stringify({
                            "contentType": "changeWorker",
                            "updateWorker": {
                                "Worker_Id": parsedMessage.workerId,
                                "FirstName": parsedMessage.newInfo.firstName,
                                "SecondName": parsedMessage.newInfo.secondName,
                                "Role": parsedMessage.newInfo.role,
                                "PhoneNumber": parsedMessage.newInfo.phoneNumber
                            },
                        }))
                    } catch (error) {
                        console.error("Error: ws.js:348", error);
                        ws.send(JSON.stringify({
                            "contentType": "error",
                            "errorMsg": "Ошибка сервера при изменении информации о сотруднике"
                        }));
                    }
                    break;
                case "removeWorker":
                    try {
                        await dbService.deleteWorkers(
                            `WHERE Worker_Id=${parsedMessage.id} AND 
                            Role='${parsedMessage.role}' AND 
                            FirstName='${parsedMessage.firstName}' AND 
                            SecondName='${parsedMessage.secondName}'`
                        )
                        ws.send(JSON.stringify({
                            "contentType": "removeWorker",
                            "id": parsedMessage.id
                        }))
                    } catch (error) {
                        console.error("Error: ws.js:348", error);
                        ws.send(JSON.stringify({
                            "contentType": "error",
                            "errorMsg": "Ошибка сервера при удалении сотрудника"
                        }));
                    }
                    break;
                case "getPriceList":
                    try {
                        const pricelist = await dbService.getPriceList(`ProductId, ProductName, MaxQuantity, Stop`, ``);
                        ws.send(JSON.stringify({
                            "contentType": "getPriceList",
                            "priceList": pricelist
                        }))
                    } catch (error) {
                        console.error("Error: ws.js:324", error);
                        ws.send(JSON.stringify({
                            "contentType": "error",
                            "errorMsg": "Ошибка сервера при получении списка блюд"
                        }));
                    }
                    break;
                case "updatePriceList":
                    try {
                        let strIdsProducts = "";
                        let strConditionsMaxQuantity = "";
                        let strConditionsStop = "";

                        parsedMessage.updatePriceList.forEach(changedProduct => {
                            strIdsProducts += changedProduct["ProductId"] + ", ";
                            strConditionsMaxQuantity += "WHEN " + changedProduct["ProductId"] + " THEN " + changedProduct["MaxQuantity"] + " ";
                            strConditionsStop += "WHEN " + changedProduct["ProductId"] + " THEN " + changedProduct["Stop"] + " ";
                        })
    
                        const query = 
                            `UPDATE pricelist
                            SET MaxQuantity = CASE ProductId 
                                ${strConditionsMaxQuantity}
                            END,
                                Stop = CASE ProductId 
                                ${strConditionsStop}
                            END
                            WHERE ProductId IN (${strIdsProducts.slice(0, -2)})`;
    
                        await dbService.customQuery(query)
    
                        ws.send(JSON.stringify({
                            "contentType": "updatePriceList",
                            "updatePriceList": parsedMessage.updatePriceList
                        }))
                    } catch (error) {
                        console.error("Error: ws.js:344", err);
                        ws.send(JSON.stringify({
                            "contentType": "error",
                            "errorMsg": "Ошибка сервера обновлении стоп-листа"
                        }));
                    }

                    break;
                case "close":
                    ws.close();
                    break;
            }
        });
        ws.on('close', () => {
            console.log('WebSocket connection closed');
            queueWorkers.removeWS(ws);
        });
    });
}

export default setupWebSocketServer;