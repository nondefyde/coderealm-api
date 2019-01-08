import AppResponse from '../../classes/api/app-response';

export default (req, res, next) => {
	// check header or url parameters or post parameters for token
	let apiKey = req.body.api_key || req.query.api_key || req.headers['x-api-key'];
	// decode token
	if (apiKey) {
		return next();
	} else {
		// if there is no token, return an error
		let meta = {};
		let code = 401;
		meta.status_code = code;
		meta.type = 1;
		meta.error = {code: code, message: 'No api key provided'};
		return res.status(meta.status_code).json(AppResponse.format(meta));
	}
};
