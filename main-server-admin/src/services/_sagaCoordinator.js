import botService from "./botService.js";
import clientService from "./clientService.js";
import dbService from "./dbService.js";
import {Reset, fgRed, fgYellow, fgGreen} from "../utils/colorsConsole.js";
import mspco from "../utils/MSPCO.js"

class SagaCoordinator {
    constructor() {
        this.clientService = clientService;
        this.botService = botService;
        this.dbService = dbService;
    }

    async acceptOrder(orderId, userId) {
        const connection = await dbService.getConnection();
        await dbService.startTransaction(connection);

        try {
            const [response1, response2] = await Promise.allSettled([
                this.botService.notifyClient(orderId, userId, "собирается"),
                this.dbService.acceptOrder(orderId, userId, connection)
            ]);
            if (response1.status === "rejected" || response2.status === "rejected") {
                let array = [];
                if (response1.status === "rejected") {
                    array.push({source: "botService", reason: response1.reason})
                }
                if (response2.status === "rejected") {
                    array.push({source: "dbService", reason: response2.reason})
                }
                throw array
            }
            await this.dbService.commitTransaction(connection);
        } catch(error) {
            console.error(fgRed, "Error acception order sCjs:31:", Reset);
            let flag = true;
            error.forEach(element => {
                switch (element.source) {
                    case "botService":
                        console.log("> BotService: ", element.reason);
                        flag = false;
                        break;
                    case "dbService":
                        console.log(">DBService: ", element.reason);
                        break;
                }
            });
            await this._compensationARCOrder(orderId, userId, "ожидает принятия", flag, connection);
            throw "Compensation is performed"
        } finally {
            dbService.releaseTransaction(connection);
        }
    }

    async _compensationARCOrder(orderId, userId, status, flag, connection) {
        console.log(fgYellow, "Perform a compensating transaction", Reset);
        await this.dbService.rollbackTransaction(connection);
        if (flag) {
            while (true) {
                const response = await this.botService.notifyClient(orderId, userId, status)
                if (response.status === "fulfilled") {
                    console.log("> botService", fgGreen, "complete", Reset);
                    break;
                } else {
                    console.log("> botService", fgGreen, "failed", Reset, response.error);
                    await new Promise(resolve => setTimeout(() => {resolve(); console.log("retry")}, 3000));
                    continue;
                }
            }
        };
    }

    async moveOrderHistory(orderId, userId, status) {
        const connection = await dbService.getConnection();
        await dbService.startTransaction(connection);

        try {
            const [response1, response2] = await Promise.allSettled([
                this.botService.notifyClient(orderId, userId, status),
                this.dbService.moveOrderHistory(orderId, userId, status, connection)
            ]);
            if (response1.status === "rejected" || response2.status === "rejected") {
                let array = [];
                if (response1.status === "rejected") {
                    array.push({source: "botService", reason: response1.reason});
                }
                if (response2.status === "rejected") {
                    array.push({source: "dbService", reason: response2.reason});
                }
                throw array;
            }
            const response3 = await this.dbService.deleteOrder(orderId, userId, connection);
            if (response3.status === "rejected") throw [{source: "dbService", reason: response3.reason}]
            await this.dbService.commitTransaction(connection);
        } catch(error) {
            console.error(fgRed, "Error rejection order sCjs:31:", Reset);
            let flag = true;
            error.forEach(element => {
                switch (element.source) {
                    case "botService":
                        console.log("> BotService: ", element.reason);
                        flag = false;
                        break;
                    case "dbService":
                        console.log("> DBService: ", element.reason);
                        break;
                }
            });
            await this._compensationARCOrder(orderId, userId, "ожидает принятия", flag, connection);
            throw "Compensation is performed"
        } finally {
            dbService.releaseTransaction(connection);
        }
    }

    async completeOrder(orderId, userId) {
        const connection = await dbService.getConnection();
        await dbService.startTransaction(connection);

        try {
            const [response1, response2] = await Promise.allSettled([
                this.botService.notifyClient(orderId, userId, "можно забирать"),
                this.dbService.completedOrder(orderId, userId, connection)
            ]);
            if (response1.status === "rejected" || response2.status === "rejected") {
                let array = [];
                if (response1.status === "rejected") {
                    array.push({source: "botService", reason: response1.reason});
                }
                if (response2.status === "rejected") {
                    array.push({source: "dbService", reason: response2.reason});
                }
                throw array;
            }
            await this.dbService.commitTransaction(connection);
        } catch(error) {
            console.error(fgRed, "Error complition order sCjs:31:", Reset);
            let flag = true;
            error.forEach(element => {
                switch (element.source) {
                    case "botService":
                        console.log("> BotService: ", element.reason);
                        flag = false;
                        break;
                    case "dbService":
                        console.log("> DBService: ", element.reason);
                        break;
                }
            });
            await this._compensationARCOrder(orderId, userId, "собирается", flag, connection);
            throw "Compensation is performed"
        } finally {
            dbService.releaseTransaction(connection);
        }
    }

    async changeStateCreationOrders() {
        const connection = await dbService.getConnection();
        await dbService.startTransaction(connection);
            
        try {
            const [response1, response2] = await Promise.allSettled([
                this.clientService.changeStateCreationOrders(),
                mspco.manualStateChange()
            ]);
            if (response1.status === "rejected" || response1.status === "rejected") {
                let array = [];
                if (response1.status === "rejected") {
                    array.push({source: "clientService", reason: response1.reason});
                }
                if (response2.status === "rejected") {
                    array.push({source: "mspco", reason: response2.reason})
                }
                throw array;
            }
            await this.dbService.commitTransaction(connection);
        } catch(error) {
            console.error(fgRed, "Error changing state of creation orders", Reset);
            let flag = true;
            error.forEach(element => {
                switch (element.source) {
                    case "clientService":
                        console.log("> ClientService: ", element.reason);
                        flag = false;
                        break;
                    case "mspco":
                        console.log("> DBService(MSPCO): ", element.reason);
                        break;
                }
            })
            await this._compensationChangeState(flag, connection);
            throw "Compensation is performed";
        } finally {
            dbService.releaseTransaction(connection);
        }
    }

    async _compensationChangeState(flag, connection) {
        console.log(fgYellow, "Perform a compensating transaction", Reset);
        await this.dbService.rollbackTransaction(connection);
        if (flag) {
            while (true) {
                const response = await this.clientService.changeStateCreationOrders();
                if (response.status === "fulfilled") {
                    console.log("> clientService", fgGreen, "complete", Reset);
                    break;
                } else {
                    console.log("> clientService", fgGreen, "failed", Reset, response.error);
                    await new Promise(resolve => setTimeout(() => {resolve(); console.log("retry")}, 3000));
                    continue;
                }
            }
        }
    }

    async changeShutdownTime(newTime, oldTime) {
        const connection = await dbService.getConnection();
        await dbService.startTransaction(connection);
        try {
            const [response1, response2] = await Promise.allSettled([
                this.clientService.changeShutdownTime(newTime),
                this.dbService.changeShutdownTime(newTime, connection),
            ])

            if (response1.status === "rejected" || response2.status === "rejected") {
                let array = [];
                if (response1.status === "rejected") {
                    array.push({source: "clientService", reason: response1.reason})
                }
                if (response2.status === "rejected") {
                    array.push({source: "dbService", reason: response1.reason})
                }
                throw array
            }
            
            mspco.params["ShutdownTime"] = newTime;
            mspco.autoStateChange();

            await this.dbService.commitTransaction(connection);
        } catch(error) {
            console.error(fgRed, "Error changing shutdown time", Reset);
            let flag = true;
            error.forEach(element => {
                switch (element.source) {
                    case "clientService":
                        console.log("> ClientService: ", element.reason);
                        flag = false;
                        break;
                    case "dbService":
                        console.log("> DBService(MSPCO): ", element.reason);
                        break;
                }
            })
            await this._compensationChangeState(flag, oldTime, connection);
            throw "Compensation is performed";
        } finally {
            dbService.releaseTransaction(connection);
        }
    }

    async _compensationChangeShutdownTime(flag, oldTime, connection) {
        console.log(fgYellow, "Perform a compensating transaction", Reset);
        await this.dbService.rollbackTransaction(connection);
        if (flag) {
            while (true) {
                const response = await this.clientService.changeShutdownTime(oldTime);
                if (response.status === "fulfilled") {
                    console.log("> clientService", fgGreen, "complete", Reset);
                    break;
                } else {
                    console.log("> clientService", fgGreen, "failed", Reset, response.error);
                    await new Promise(resolve => setTimeout(() => {resolve(); console.log("retry")}, 3000));
                    continue;
                }
            }
        }
    }

    async cancelStuckOrder() {
        let orders;

        try {
            orders = await this.dbService.getOrders();
        } catch (error) {
            console.log(fgRed, "Error cancel order sCjs:208:", Reset)
            throw error
        }

        for (const order of orders) {
            const connection = await dbService.getConnection();
            await dbService.startTransaction(connection);

            try {
                const response1 = await this.botService.notifyClient(order.OrderId, order.UserId, "отменен системой");
                const response2 = await this.dbService.moveOrderStuck(order, connection);

                if (response1.status === "rejected" || response1.status === "rejected") {
                    let array = [];
                    if (response1.status === "rejected") {
                        array.push({source: "botService", reason: response1.reason})
                    }
                    if (response2.status === "rejected") {
                        array.push({source: "dbService", reason: response1.reason})
                    }
                    throw array;
                }
                const response3 = await this.dbService.deleteOrder(order.OrderId, order.UserId, connection);
                if (response3.status === "reject") throw [{source: "dbService", reason: response3.reason}]
                await this.dbService.commitTransaction(connection);
            } catch (error) {
                console.error(fgRed, "Error cancel order sCjs:233:", Reset);
                error.forEach(element => {
                    switch (element.source) {
                        case "botService":
                            console.log("> BotService: ", element.reason);
                            break;
                        case "dbService":
                            console.log("> DBService: ", element.reason);
                            break;
                    }
                })
                await this._compensationCancelOrder(connection);
                console.log(fgGreen, "Compensation is performed", Reset);
            } finally {
                dbService.releaseTransaction(connection);
            }
            await new Promise(resolve => setTimeout(() => {resolve(); console.log("retry")}, 3000));
        }
    }

    async _compensationCancelOrder(connection) {
        console.log(fgYellow, "Perform a compensating transaction", Reset);
        await this.dbService.rollbackTransaction(connection);
    }
}

const sagaCoordinator = new SagaCoordinator();

export default sagaCoordinator;