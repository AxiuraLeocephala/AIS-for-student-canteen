import fetch from "node-fetch";

class ClientService {
    constructor() {
        this.url = "https://meridian-back.studentcanteen.ru/server-client/"
    }

    changeStateCreationOrders() {
        return fetch(this.url + "changeStateCreationOrders", {
            headers: {
                'Content-Type': 'application/json'
            },
            method: "POST"
        })
        // return new Promise(resolve => setTimeout(resolve(), 1000));
    }

    changeShutdownTime(time) {
        return fetch(this.url + "changeShutdownTime", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "time": time
            })
        })
        // return new Promise(resolve => setTimeout(resolve(), 1000));
    }
}

const clientService = new ClientService()

export default clientService