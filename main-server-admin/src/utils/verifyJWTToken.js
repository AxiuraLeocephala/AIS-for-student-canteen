import jwt from 'jsonwebtoken' 
import dbService from '../services/dbService.js';

const JWT_KEY = 'FMXF15Uz-m6*P0bVh-5&7Se*nf-ow!HXwbi';

async function VerifyToken(token) {
	return jwt.verify(token, JWT_KEY, async(err, jwt) => {
		if (err) {
			console.log("VerifyJWTToken:9 ", err);
			return false;
		}
		if (jwt.type === "refresh" || (jwt.user.is !== "admin" && jwt.user.is !== "worker")) {
			console.log("VerifyJWTToken:13 ", "jwt is verify, but isn`t valid");
			return false;
		}
		try {
			const [jti] = await dbService.getJWT(`JTI`, `WHERE JTI = "${jwt.jti}"`)
			if (jti) {
				return jwt
			} else {
				console.log("VerifyJWTToken:21 ", "jwt not in whitelist");
				return false
			}
		} catch (error) {
			console.log("VerifyJWTToken:25 ", error)
			return false
		}
	});
}

export default VerifyToken;