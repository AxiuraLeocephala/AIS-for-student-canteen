import express from 'express';
import morgan from "morgan";

import CORS from './src/middlewares/CORS.js';
import {
    middleware_reactToAuthServer_client,
    middleware_reactToServer_client,
    middlewares_reactToAuthServer_admin,
    middlewares_reactToServer_admin,
} from "./src/routers/routers.js";
import { HOST, PORT } from './src/config/serverConfig.js';

const app = express();

app.use(CORS);
app.use(morgan("common"));
app.use('/user-api', middleware_reactToAuthServer_client);
app.use('/product-api', middleware_reactToServer_client);
app.use('/ws/admin-api', middlewares_reactToAuthServer_admin);
app.use('/ws/adminpanel-api', middlewares_reactToServer_admin);

function startServer() {
    try {
        const server = app.listen(PORT, HOST, () => {
            console.log(`Proxy server is running on ${HOST}:${PORT}`);
        });
        server.on('upgrade', (req, socket, head) => {
            if (req.url.startsWith('/ws/admin-api')) {
                middlewares_reactToAuthServer_admin.upgrade(req, socket, head);
            } else if (req.url.startsWith('/ws/adminpanel-api')) {
                middlewares_reactToServer_admin.upgrade(req, socket, head);
            } else {
                socket.destroy();
            }
        });
        process.on("SIGINT", () => {
            console.log("SIGINT signal received");
            server.close(() => {
                console.log("Closed out remaining connections");
                process.exit(0);
            })
        })
    } catch (error) {
        console.error("Server error: ", error);
        process.exit(1);
    }
}

startServer();