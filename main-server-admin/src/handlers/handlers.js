import queueMessages from "../structuresData/queueMessages.js";

async function handlerNewOrder(req, res) {
    queueMessages.enqueue({
        "contentType": "newOrder",
        "info": {
            "OrderId": req.body.orderId, 
            "UserId": `${req.body.userId}`, 
            "Products": req.body.products, 
            "PaymentMethod": req.body.paymentMethod,
            "Status": "confirmation"
        }
    });
    res.sendStatus(200);
}

async function handlerRemoveOrder() {
    queueMessages.enqueue({
        "contentType": "removeNewOrder",
        "info": {
            "OrderId": req.body.orderId,
            "UserId": req.body.userId
        }
    });
    res.sendStatus(200);
}

export { handlerNewOrder, handlerRemoveOrder }