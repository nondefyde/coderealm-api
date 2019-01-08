import config from 'config';
import auth from './auth/auth.route';
import users from './user/user.route';
import media from './media/media.route';
import resources from './resource/resource.route';
import AppError from '../classes/api/app-error';
import lang from '../lang/index';
import { NOT_FOUND } from '../utils/status-codes';
import apiAuth from '../middlewares/auth/api_auth';
import Q from 'q';

const prefix = config.get('api.prefix');
/**
 * The routes will add all the application defined routes
 * @param {express} app The app is an instance of an express application
 * @return {Promise<void>}
 */
export default (app) => {
	app.use(prefix, apiAuth);
	// Prevent unauthorized access
	app.use(prefix, auth);
	app.use(prefix, users);
	app.use(prefix, resources);
	app.use(prefix, media);

	// check url for state codes and api version
	// catch 404 and forward to error handler
	app.use('*', (req, res, next) => {
		const appError = new AppError(lang.get('error').resource_not_found, NOT_FOUND);
		return next(appError);
	});
	return Q.resolve(app);
};
