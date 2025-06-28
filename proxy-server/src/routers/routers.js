import { createProxyMiddleware } from "http-proxy-middleware";

import { 
    optionsMiddlewares_reactToAuthServer_client,
    optionsMiddlewares_reactToServer_client, 
    optionsMiddlewares_reactToAuthServer_admin,
    optionsMiddlewares_reactToServer_admin,
} from "../optionsRoutes/optionsRoutes.js";

// from react-app-client to authenticate-server
const middleware_reactToAuthServer_client = createProxyMiddleware(optionsMiddlewares_reactToAuthServer_client);
// from react-app-client to main-server-client
const middleware_reactToServer_client = createProxyMiddleware(optionsMiddlewares_reactToServer_client);
// from react-app-admin to authenticate-server (websocket)
const middlewares_reactToAuthServer_admin = createProxyMiddleware(optionsMiddlewares_reactToAuthServer_admin);
// from react-app-admin to main-server-admin (websocket)
const middlewares_reactToServer_admin = createProxyMiddleware(optionsMiddlewares_reactToServer_admin);

export {
    middleware_reactToAuthServer_client,
    middleware_reactToServer_client,
    middlewares_reactToAuthServer_admin,
    middlewares_reactToServer_admin,
}