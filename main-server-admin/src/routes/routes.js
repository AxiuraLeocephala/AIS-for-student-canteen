import { Router } from 'express';
import { handlerNewOrder, handlerRemoveOrder } from '../handlers/handlers.js';

const routerNewOrder = Router();
const routerRemoveOrder = Router();

routerNewOrder.post('/createOrder', handlerNewOrder)
routerRemoveOrder.post('/removeNewOrder', handlerRemoveOrder)

export { routerNewOrder, routerRemoveOrder }