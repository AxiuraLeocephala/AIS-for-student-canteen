// from react-app-client to authenticate-server
const optionsMiddlewares_reactToAuthServer_client = {
    target: 'https://meridian-auth.studentcanteen.ru',
    secure: true,
    changeOrigin: true,
    pathRewrite: {
        '^/user-api' : '',
    },
    on: {
        proxyRes: (proxyRes, req, res) => {
            proxyRes.headers['access-control-allow-origin'] = 'https://meridian.studentcanteen.ru';
            delete proxyRes.headers['x-powered-by'];
            delete proxyRes.headers['server'];
        }
    }
}
// from react-app-client to main-server-client
const optionsMiddlewares_reactToServer_client = {
    target: 'https://meridian-back.studentcanteen.ru',
    secure: true,
    changeOrigin: true,
    pathRewrite: {
        '^/product-api' : '',
    },
    on: {
        proxyRes: (proxyRes, req, res) => {
            proxyRes.headers['access-control-allow-origin'] = 'https://meridian.studentcanteen.ru';
            delete proxyRes.headers['x-powered-by'];
            delete proxyRes.headers['server'];
        }
    },
}

// from react-app-admin to authenticate-server (websocket)
const optionsMiddlewares_reactToAuthServer_admin = {
    target: "https://meridian-auth.studentcanteen.ru/ws",
    secure: true,
    changeOrigin: true,
    ws: true,
    pathRewrite: {
        '^/ws/admin-api' : '',
    },
    on: {
        proxyReq: (proxyReq, req, res) => {
            console.log('[HTTP]', req.method, req.originalUrl, '→', proxyReq.protocol + '//' + proxyReq.host);
        },
        proxyReqWs: (proxyReq, req, socket, options, head) => {
            console.log('[WS]', req.url, '→', options.target);
        },
        proxyRes: (proxyRes, req, res) => {
            proxyRes.headers['access-control-allow-origin'] = 'https://meridian-admin.studentcanteen.ru';
            delete proxyRes.headers['x-powered-by'];
            delete proxyRes.headers['server'];
        }
    }
}

// from react-app-admin to main-server-admin (websocket)
const optionsMiddlewares_reactToServer_admin = {
    target: "https://meridian-admin-back.studentcanteen.ru/ws",
    secure: true,
    changeOrigin: true,
    ws: true,
    pathRewrite: {
        '^/ws/adminpanel-api' : '',
    },
    on: {
        proxyReq: (proxyReq, req, res) => {
            console.log('[HTTP]', req.method, req.originalUrl, '→', proxyReq.protocol + '//' + proxyReq.host);
        },
        proxyReqWs: (proxyReq, req, socket, options, head) => {
            console.log('[WS]', req.url, '→', options.target);
        },
        proxyRes: (proxyRes, req, res) => {
            proxyRes.headers['access-control-allow-origin'] = 'https://meridian-admin.studentcanteen.ru';
            delete proxyRes.headers['x-powered-by'];
            delete proxyRes.headers['server'];
        }
    }
}


export { 
    optionsMiddlewares_reactToAuthServer_client,
    optionsMiddlewares_reactToServer_client, 
    optionsMiddlewares_reactToAuthServer_admin,
    optionsMiddlewares_reactToServer_admin,
}