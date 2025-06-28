import fetch from 'node-fetch';

class BotService {
    constructor() {
        this.url = "https://meridian-bot.studentcanteen.ru/bot/order/" 
    }

    createOrder(orderId, userId, products, paymentMethod, codeReceive) {
        console.log('1.3.1');
        return fetch(this.url + "createOrder", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "userId": userId,
                "orderId": orderId,
                "codeReceive": codeReceive,
                "products": products,
                "paymentMethod": paymentMethod
            })
        })
        // return new Promise((resolve, reject) => {
        //     console.log("create order bot-service")
        //     resolve()
        // })
    }

    cancelOrder(orderId, userId) {
        return fetch(this.url + "cancelOrder", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "userId": userId,
                "orderId": orderId,
            })
        })
    }
}

const botService = new BotService();

export default botService