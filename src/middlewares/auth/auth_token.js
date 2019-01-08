import jwt from 'jsonwebtoken'; // used to create, sign, and verify tokens
import config from 'config';
import _ from 'underscore';
import AppError from '../../classes/api/app-error';
import lang from '../../lang/index';
import {UNAUTHORIZED} from '../../utils/status-codes';
import {GET, POST} from '../../utils/request-methods';

export const excluded = [
	{route: '', method: GET},
	{route: 'authenticate', method: POST},
	{route: 'login', method: POST},
	{route: 'register', method: POST},
	{route: 'verify-link', method: POST},
	{route: 'reset-password', method: POST},
	{route: 'update-password', method: POST},
	{route: 'social-auth/facebook', method: POST},
	{route: 'social-auth/google', method: POST},
];

export default (req, res, next) => {
	const currentUrlPath = req.originalUrl.split('?')[0];
	const filtered = _.filter(excluded, (item) => {
		// Api version and country code
		const regex = new RegExp(`^/api/v[1-9]/${item.route}$`);
		return regex.test(currentUrlPath) && req.method.toLowerCase() == item.method;
	});
	if (filtered.length) return next();
	const token = req.body.token || req.query.token || req.headers['x-access-token'];
	// decode token
	if (token) {
		// verifies secret and checks exp
		jwt.verify(token, config.get('authToken.superSecret'), (err, decoded) => {
			if (err) {
				let message = '';
				if (err.name) {
					switch (err.name) {
					case 'TokenExpiredError':
						message = 'You are not logged in!';
						break;
					default:
						message = 'Failed to authenticate token';
						break;
					}
				}
				const appError = new AppError(message, UNAUTHORIZED, null, 2);
				return next(appError);
			} else {
				req.userId = decoded.userId;
				next();
			}
		});
	} else {
		const appError = new AppError(lang.get('error').not_auth_token, UNAUTHORIZED);
		return next(appError);
	}
};
