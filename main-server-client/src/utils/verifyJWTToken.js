import jwt from 'jsonwebtoken';
import { JWT_KEY } from "../config/serverConfig.js";
import dbService  from '../services/dbService.js';

function VerifyToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if (token == null) return res.sendStatus(401);

	jwt.verify(token, JWT_KEY, (err, jwt) => {
		if (err){
			console.warning("Error verifying the access token", err);
			return res.sendStatus(401)
		};
		if (jwt.type === 'refresh') {
			console.log("TokenNotValidError: jwt is refresh")
			return res.sendStatus(401);
		};
		let JWTInDB;
		try {
			JWTInDB = dbService.getJTI(jwt.jti);
		} catch (error) {
			console.log('Error selecting to MySQL:', error);
			return res.status(500).json({err: 'Ой. Что-то пошло не так'});
		}
		if (JWTInDB === null) {
			console.log("TokenNotValidError: token is null")
			return res.sendStatus(401)
		};
		req.jwt = jwt;
		next();
	});
}

export default VerifyToken;