import express from 'express';
import {createServer} from 'http';
import morgan from 'morgan';

import { PORT, HOST } from "./src/config/serverConfig.js"
import setupWebSocketServer from './src/webSocketServer/webSocketServer.js';
import CORS from './src/middlewares/CORS.js';
import { routerNewOrder, routerRemoveOrder } from "./src/routes/routes.js";
import processQueueMessages from './src/utils/processQueueMessages.js';
import processDeleteProducts from "./src/bgTask/deleteProducts.js";

const app = express();

app.use(express.json());
app.use(morgan("common"));
app.use('/server-admin', routerNewOrder);
app.use('/server-admin', routerRemoveOrder);
app.use(CORS);

const server = createServer(app);

async function startServer() {
    try {
        processQueueMessages();
        processDeleteProducts();
        setupWebSocketServer(server);
        server.listen(HOST, PORT, () => {
            console.log('> Server running on port 3004');
        });
    } catch (err) {
        console.error('\x1b[31m', 'Error starting server:', err);
        process.exit(1);
    }
}

startServer();