import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';

import { HOST, PORT } from "./src/config/serverConfig.js";
import CORS from "./src/middlewares/CORS.js"; 
import { 
	routerPriceList, routerProductInBusket, routerAddTBusket, 
	routerIncreaseQuantity, routerReduceNumber, routerOrder, 
	routerMakeOrder, routerChangeStateCreationOrders, routerChangeShutdownTime 
} from './src/routes/routers.js';
import dbService from "./src/services/dbService.js";

const app = express();

app.use(morgan('common'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(CORS);

app.use('/data', routerPriceList);
app.use('/data', routerProductInBusket);
app.use('/data', routerAddTBusket);
app.use('/data', routerIncreaseQuantity);
app.use('/data', routerReduceNumber);
app.use('/data', routerOrder);
app.use('/data', routerMakeOrder);
app.use('/server-client', routerChangeStateCreationOrders);
app.use('/server-client', routerChangeShutdownTime);

async function startServer() {
	try {
		const server = app.listen(PORT, HOST, () => {
			console.log(`Server is running on ${HOST}:${PORT}`);
		});
		process.on("SIGINT", () => {
			console.log("SIGINT signal received");
			server.close(async () => {
				console.log("Closed out remaining connections");
				await dbService.close();
				process.exit(0)
			});
		})
	} catch (error) {
		console.error("Server error:", error);
		process.exit(1);
	}
}

startServer();