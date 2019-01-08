import config from 'config';
import _ from 'underscore';
import resourceModels from '../../api/resource/index';
import {NOT_FOUND} from '../../utils/status-codes';
import AppError from '../../classes/api/app-error';
import lang from '../../lang/index';

export default async (req, res, next) => {
	const url = req.url;
	const path = new RegExp(`${config.get('api.resourceRegex')}`).exec(url);
	if (path) {
		const parts = path[0].split('/');
		const resourceName = parts[2];
		const resource = await _.find(resourceModels, {resource_name: resourceName});
		if (!resource) {
			const appError = new AppError(lang.get('error').inputs, NOT_FOUND);
			return next(appError);
		}
		req.resource = resource;
	}
	return next();
};
