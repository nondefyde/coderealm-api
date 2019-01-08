import Setup from '../../setup';
import config from 'config';

export default (req, res, next) => {
	const url = req.originalUrl;
	const path = config.get('api.prefix').exec(url);
	const parts = path[0].split('/');
	const apiVersion = parts[2];
	const apiVersions = config.get('api.versions');
	if (apiVersions.indexOf(apiVersion) > -1) {
		console.log('New api version ', apiVersion);
		Setup.setupApiVersion(apiVersion);
	}
	return next();
};
