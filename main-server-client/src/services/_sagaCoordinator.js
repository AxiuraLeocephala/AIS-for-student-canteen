import adminService from "./adminService.js";
import botService from "./botService.js";
import dbService from "./dbService.js";
import { Reset, fgRed, fgYellow, fgGreen } from "./../utils/colorsConsole.js";

class SagaCoordinator {
    constructor() {
        this.adminService = adminService;
        this.dbService = dbService;
        this.botService = botService;
    }

    async createOrder(orderId, userId, products, paymentMethod, codeReceive, currentDateTimeMySQLFormat) {
        try {
            const [response1, response2] = await Promise.allSettled([
                this.adminService.createOrder(orderId, userId, products, paymentMethod),
                this.dbService.createOrder(orderId, userId, products, paymentMethod, codeReceive, currentDateTimeMySQLFormat)
            ]);
            
            if (response1.status === "rejected" || response2.status === "rejected") {
                let array = [];
                if (response1.status === "rejected") {
                    array.push({source: "adminService", reason: response1.reason})
                }
                if (response2.status === "rejected") {
                    array.push({source: "dbService", reason: response2.reason})
                }
                throw array;
            }
            const response3 = await this.botService.createOrder(orderId, userId, products, paymentMethod, codeReceive);
            if (response3.status === "rejected") throw [{source: "botService", reason: response3.reason}];
        } catch (error) {
            console.log(fgRed, "Error creation order sCjs:42:", Reset);
            console.log(error)
            let services = [];
            error.forEach(element => {
                switch (element.source) {
                    case "adminService":
                        console.log("> AdminService: ", element.reason);
                        services.push(this.dbService);
                        break;
                    case "dbService":
                        console.log("> DBService: ", element.reason);
                        services.push(this.adminService);
                        break;
                    case "botService":
                        console.log("> BotService: ", element.reason);
                        services.push(this.adminService, this.dbService);
                        break;
                    default:
                        console.log(fgYellow, "Unknow service", Reset);
                        break;
                }
            });
            await this.cancelOrder(services, orderId, userId);
            throw "Compensation is performed";
        }
    }

    async cancelOrder(services, orderId, userId) {
        console.log(fgYellow, "Perform a compensating transaction", Reset);
        while (services.length > 0) {
            for (const service of services) {
                const [response] = await service.cancelOrder(orderId, userId)
                console.log(response, response.status)
                if (response.status === "fulfilled") {
                    console.log("> ", service, fgGreen, "completed", Reset);
                    services.splice(0, 1);
                } else {
                    console.log(">", service, fgRed, "failed:\n", Reset, response.error)
                    await new Promise(resolve => setTimeout(() => {resolve(); console.log("retry")}, 3000));
                }
            }
        }
    }
}

const sagaCoordinator = new SagaCoordinator();

export default sagaCoordinator;