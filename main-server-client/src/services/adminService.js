import fetch from 'node-fetch';

class AdminService {
    constructor() {
        this.url = "https://meridian-admin-back.studentcanteen.ru/server-admin/"
    }

    createOrder(orderId, userId, products, paymentMethod) {
        return fetch(this.url + "createOrder", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "orderId": orderId,
                "userId": userId,
                "products": products,
                "paymentMethod": paymentMethod
            })
        })

        // return new Promise((resolve, reject) => {
        //     console.log("create order admin-service")
        //     resolve()
        // })
    }

    cancelOrder(orderId, userId) {
        return fetch(this.url + "cancelOrder", {
            method: "POST",
            headers: {
                'Content-Type': 'aplication/json'
            },
            body: JSON.stringify({
                "orderId": orderId,
                "userId": userId
            })
        })
    }
}

const adminService = new AdminService();

export default adminService