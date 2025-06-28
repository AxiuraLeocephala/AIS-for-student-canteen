import { Router } from 'express';

import VerifyToken from './../utils/verifyJWTToken.js';
import { 
    PriceList, ProductsInBusket, AddToBusket, 
    IncreaseQuantity, ReduceNumber, Order, 
    MakeOrder, ChangeStateCreationOrders, ChangeShutdownTime 
} from "./../handlers/handlers.js";

const routerPriceList = Router();
const routerProductInBusket = Router();
const routerAddTBusket = Router();
const routerIncreaseQuantity = Router();
const routerReduceNumber = Router();
const routerOrder = Router();
const routerMakeOrder = Router();
const routerChangeStateCreationOrders = Router();
const routerChangeShutdownTime = Router();

routerPriceList.get('/priceList', VerifyToken, PriceList)
routerProductInBusket.get('/productInBusket', VerifyToken, ProductsInBusket)
routerAddTBusket.post('/addToBusket', VerifyToken, AddToBusket)
routerIncreaseQuantity.post('/increaseQuantity', VerifyToken, IncreaseQuantity)
routerReduceNumber.post('/reduceNumber', VerifyToken, ReduceNumber)
routerOrder.get('/order', VerifyToken, Order)
routerMakeOrder.post("/makeOrder", VerifyToken, MakeOrder)
routerChangeStateCreationOrders.post('/changeStateCreationOrders', ChangeStateCreationOrders)
routerChangeShutdownTime.post('/changeShutdownTime', ChangeShutdownTime)

export {
    routerPriceList,
    routerProductInBusket,
    routerAddTBusket,
    routerIncreaseQuantity,
    routerReduceNumber,
    routerOrder,
    routerMakeOrder,
    routerChangeStateCreationOrders,
    routerChangeShutdownTime
};