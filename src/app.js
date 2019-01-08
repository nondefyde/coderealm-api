import http from 'http';
import config from 'config';
import loadRoutes from './api';
import mongooseConfig from './setup/mongoose';
import middlewareConfig from './setup/middleware';
import expressConfig from './setup/express';
import apiVersion from './setup/api-version';
import Q from 'q';

export default mongooseConfig(config)
	.then(() => {
		return apiVersion(config);
	})
	.then(() => {
		return expressConfig;
	})
	.then((app) => {
		return loadRoutes(app);
	})
	.then((app) => {
		return middlewareConfig(app);
	})
	.then(async (app) => {
		app.set('port', config.get('app.port'));
		return Q.all([http.createServer(app), app]);
	})
	.spread((server, app) => {
		return Q.all([server.listen(config.get('app.port')), app]);
	})
	.spread((server, app) => {
		console.log(`Application listening on ${config.get('app.baseUrl')}, Environment => ${config.util.getEnv('NODE_ENV')}`);
		return Q.resolve(app);
	}, err => {
		console.log('There was an un catch error : ');
		console.error(err);
	});
