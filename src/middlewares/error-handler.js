import MongooseError from 'mongoose/lib/error';
import AppError from '../classes/api/app-error';
import config from 'config';
import AppResponse from '../classes/api/app-response';

export default (error, req, res, next) => {
	const meta = {};
	if (error instanceof MongooseError) {
		const code = 503;
		meta.status_code = code;
		meta.error = {code, message: 'Some setup problems, please try again'};
		meta.developer_message = error;
	}
	else if (error instanceof AppError) {
		const err = error.format();
		const code = err.code;
		meta.status_code = code;
		meta.error = {code, message: err.message};
		if (err.messages) {
			meta.error.messages = err.messages;
		}
		if (err.type) {
			meta.error.type = err.type;
		}
	}
	else {
		let code = 500;
		meta.status_code = code;
		meta.error = {code: code, message: 'A problem with our server, please try again later'};
		meta.developer_message = error;
	}
	if (`${config.util.getEnv('NODE_ENV')}` !== 'production') {
		console.log('error >>>>>>>>>>>>>>> ', error.message);
	}
	return res.status(meta.status_code).json(AppResponse.format(meta));
};
