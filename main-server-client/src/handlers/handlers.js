import dbService from "./../services/dbService.js";
import ConvertPhoto from './../utils/covertPhoto.js';
import GenIdOrder from './../utils/genIdOrder.js';
import GenCodeOrder from './../utils/genCodeOrder.js';
import msco from './../utils/MSCO.js';
import sagaCoordinator from './../services/_sagaCoordinator.js';
import CheckStopProducts from './../utils/checkStopProducts.js';
import dateTime from "../utils/dateTime.js";

async function PriceList(req, res) {
    const userId = req.jwt.user['id'];
    let isChanged;

    try {
        let [productCategory, productsMenu] = await Promise.all([
            dbService.getCategories(),
            dbService.getPriceList(userId)
            
        ])
        productsMenu, isChanged = await CheckStopProducts(productsMenu, userId);
        productsMenu = ConvertPhoto(productsMenu);
        return res.status(200).json([productCategory, productsMenu]);
    } catch (error) {
        console.error("Error routers.js:64", error);
        return res.status(500).json({err: 'Ой-ой, возникла ошибка. Код ошибки: hjs:64'})
    }
}

async function ProductsInBusket(req, res) {
    const userId = req.jwt.user['id'];
    let productsBusket;
    let isChanged;

    try {
        productsBusket = await dbService.getBusket(userId)
        if (productsBusket.length > 0) {
            productsBusket, isChanged = await CheckStopProducts(productsBusket, userId);
            if (isChanged) {
                productsBusket = productsBusket.filter(product => product["Stop"] !== 1)
            }
            productsBusket = ConvertPhoto(productsBusket);
            return res.status(200).json([productsBusket, isChanged])
        } else {
            return res.status(200).json([]);
        }
    } catch (error) {
        console.error('Error routers.js:102', error);
        return res.status(500).json({err: 'Ой-ой, возникла ошибка. Код ошибки: hjs:102'})
    }
}

async function AddToBusket(req, res) {
    const userId = req.jwt.user['id'];
    const productId = req.body['productId'];

    try {
        await dbService.addToBusket(productId, userId);
        return res.sendStatus(200);
    } catch(err) {
        console.error('Error routers.js:120', err)
        return res.status(500).json({err: 'Ой-ой, возникла ошибка. Код ошибки: rjs:120'})
    }
}

async function IncreaseQuantity(req, res) {
    const userId = req.jwt.user['id'];
    const productId = req.body['productId'];

    try {
        const result = await dbService.inscreaseQuantity(productId, userId);

        if (result.changedRows === 0) {
            return res.sendStatus(422);
        } else {
            return res.sendStatus(200);
        }
    } catch (err) {
        console.error('Error routers.js:167', err);
        return res.status(500).json({err: 'Ой-ой, возникла ошибка. Код ошибки: rjs:167'});
    }
}

async function ReduceNumber(req, res) {
    const userId = req.jwt.user['id'];
    const productId = req.body['productId'];

    const connection = await dbService.getConnection();
    await dbService.startTransaction(connection);

    try {
        await dbService.updateBusketReduce(productId, userId, connection);
        const quantity = await dbService.getQuantityProductsInBusket(productId, userId, connection);

        if (quantity[0]['Quantity'] === 0) {
            try {
                await dbService.updateBusketRemoveProduct(productId, userId, connection);
                await dbService.commitTransaction(connection);
                return res.sendStatus(200);
            } catch(err) {
                await dbService.rollbackTransaction(connection);
                console.error('Error routers.js:232', err);
                return res.status(500).json({err: 'Ой-ой, возникла ошибка. Код ошибки: rjs:232'});
            }
        } else {
            await dbService.commitTransaction(connection);
            return res.status(200).json({quantity: quantity[0]['Quantity']})
        }
    } catch(error) {
        await dbService.rollbackTransaction(connection);
        console.error('Error routers.js:190', err);
        return res.status(500).json({err: 'Ой-ой, возникла ошибка. Код ошибки: rjs:190'});
    } finally {
        dbService.releaseTransaction(connection);
    }
}

async function Order(req, res) {
    if (!msco.params["StateCreationOrders"]) {
        return res.status(503).json({err: "Создание заказа временно не доступно.\n Попробуйте позже."});
    }

    const userId = req.jwt.user['id'];
    let isChanged;

    try {
        let data = await dbService.getOrderInfo(userId);
        
        data, isChanged = await CheckStopProducts(data, userId);
        const arrayPrice = data.map(dataRow => {
            return dataRow['ProductPrice'] * dataRow['Quantity'];
        })
        const totalPrice = arrayPrice.reduce((partialSum, a) => partialSum + a, 0);

        res.status(200).json({totalPrice: totalPrice, isChanged: isChanged});
    } catch(error) {
        console.error('Error routers.js:266', error);
        return res.status(500).json({error: 'Ой-ой, возникла ошибка. Код ошибки: rjs:226'});
    }
}

async function MakeOrder(req, res) {
    const userId = req.jwt.user["id"];
    const queryId = req.jwt.qi;
    const paymentMethod = req.body['paymentMethod'];

    try {
        const [products, orderId, codeReceive, currentDateTimeMySQLFormat] = await Promise.all([
            dbService.makeOrder(userId),
            GenIdOrder(),
            GenCodeOrder(),
            dateTime.getCurrentDateTimeMySQLFormat()
        ])

        await sagaCoordinator.createOrder(orderId, userId, products, paymentMethod, codeReceive, currentDateTimeMySQLFormat);
        
        res.status(200).json({
            "qi": queryId,
            "orderId": orderId,
            "codeReceive": codeReceive,
        });
    } catch(error) {
        console.error('Error routers.js:341', error);
        return res.status(500).json({error: 'Ой-ой, возникла ошибка. Код ошибки: rjs:396'});
    }
}

async function ChangeStateCreationOrders(req, res) {
    msco.manualStateChange();
    res.sendStatus(200);
}

async function ChangeShutdownTime(req, res) {
    msco.params["ShutdownTime"] = req.body["time"];
    msco.autoStateChange();
    res.sendStatus(200);
}

export {
    PriceList,
    ProductsInBusket,
    AddToBusket,
    IncreaseQuantity,
    ReduceNumber,
    Order,
    MakeOrder,
    ChangeStateCreationOrders,
    ChangeShutdownTime
}