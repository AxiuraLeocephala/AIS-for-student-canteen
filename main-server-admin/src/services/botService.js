import fetch from "node-fetch";

class BotService {
    constructor() {
        this.url = "https://meridian-bot.studentcanteen.ru/bot/order/"
    }

    notifyClient(orderId, userId, status) {
        return fetch(this.url + "changeStatusOrder", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "userId": userId,
                "orderId": orderId,
                "status": status
            })
        })
    }
}

const botService = new BotService()

export default botService