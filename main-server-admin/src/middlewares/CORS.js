import { ALLOWED_ORIGIN_CORS } from "./../config/serverConfig.js";

function CORS(req, res, next) {
	if (ALLOWED_ORIGIN_CORS.includes(req.headers.origin)) {
		res.header('Access-Control-Allow-Origin', ALLOWED_ORIGIN_CORS);
	} else {
		res.header('Access-Control-Allow-Origin', '')
	}
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept');
    next();
}

export default CORS;