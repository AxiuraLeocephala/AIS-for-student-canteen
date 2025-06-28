import dbService from "../services/dbService.js";
import queueMessages from "../structuresData/queueMessages.js";

// managing system parameters for creation order
class MSPCO {
    constructor() {
        this.init();
        this.params = {};
        this.timer = 0;
    }

    async init() {
        try {
            const [systemParameters] = await dbService.getSystemParameters(`*`, ``)
            this.params = this.mapResultParams(systemParameters);
        } catch (err) {
            console.error("Error MSPCO:65", err);
        }
    }

    mapResultParams(systemParameters) {
        const params = {};
        Object.entries(systemParameters).forEach(([key, value]) => {
            params[key] = value
        });
        return params;
    }

    async manualStateChange() {
        await this.changeState();
        await this.autoStateChange();
    }

    async autoStateChange() {
        if (this.params["StateCreationOrders"]) {
            const ct = new Date();
            const delay = parseInt(this.params["ShutdownTime"].slice(0, 2))*36*10**5 + 
            parseInt(this.params["ShutdownTime"].slice(3, 5))*6*10**4 - 
            ct.getHours()*36*10**5 - ct.getMinutes()*6*10**4;

            if (delay > 0) {
                this.timer = setTimeout(async () => {
                    await this.changeState();
                }, delay);
            } else {
                clearInterval(this.timer);
                await this.changeState();
            }
        }
    }
    
    async changeState() {
        try {
            this.params["StateCreationOrders"] = !this.params["StateCreationOrders"];
            await dbService.updateSystemParameters(`SET StateCreationOrders=${this.params["StateCreationOrders"]}`, ``);
            queueMessages.enqueue({
                "contentType": "changeStateCreationOrders",
                "info": {
                    "newStateCreationOrders": mspco.params["StateCreationOrders"]
                }
            })
        } catch (err) {
            console.error("Error MSPCO:100", err);
        }
    }
}

const mspco = new MSPCO();

export default mspco;