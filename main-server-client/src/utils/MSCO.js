import dbService from "./../services/dbService.js";

// managing state for creation order
class MSCO {
    constructor() {
        this.init();
        this.params = {};
        this.timer = 0;
    }

    async init() {
        try {
            const [result] = await dbService.getSystemParameters();
            this.params = this.mapResultParams(result);
        } catch (err) {
            console.error("Error MSCO:10", err);
        }
    }

    mapResultParams(result) {
        const params = {};
        Object.entries(result).forEach(([key, value]) => {
            params[key] = value
        });
        return params;
    }

    manualStateChange() {
        this.params["StateCreationOrders"] = !this.params["StateCreationOrders"];
        this.autoStateChange();
    }

    autoStateChange() {
        if (this.params["StateCreationOrders"]) {
            const ct = new Date();
            const delay = parseInt(this.params["ShutdownTime"].slice(0, 2))*36*10**5 + 
            parseInt(this.params["ShutdownTime"].slice(3, 5))*6*10**4 - 
            ct.getHours()*36*10**5 - ct.getMinutes()*6*10**4;

            if (delay > 0) {
                console.log("Планирование изменения")
                this.timer = setInterval(() => {
                    this.params["StateCreationOrders"] = !this.params["StateCreationOrders"];
                }, delay);
            } else {
                console.log("Немедленнное изменение")
                clearInterval(this.timer);
                this.params["StateCreationOrders"] = !this.params["StateCreationOrders"];
            }
        }
    }
}

const msco = new MSCO()

export default msco