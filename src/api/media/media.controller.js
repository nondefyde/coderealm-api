import _ from 'underscore';
import lang from '../../lang';
import {BAD_REQUEST, OK} from '../../utils/status-codes';
import AppError from '../../classes/api/app-error';
import AppResponse from '../../classes/api/app-response';
import AppController from '../_core/app.controller';

/**
 * The Base controller class where other controller inherits or
 * overrides pre defined and existing properties
 */
class MediaController extends AppController {
	/**
	 * @param {Model} name The name property is inherited
	 * from the parent
	 */
	constructor(name) {
		super(name);
		this.upload = this.upload.bind(this);
	}

	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 * @return {Object} res The response object
	 */
	upload(req, res, next) {
		const user = req.userId;
		if (!req.file || _.isEmpty(req.file)) {
			const appError = new AppError(lang.get('file').no_file_uploaded, BAD_REQUEST);
			return next(appError);
		}
		const fileObj = req.file;
		const file = {
			url: fileObj.location,
			key: fileObj.key,
		};
		const media = new this.model({user, file});
		media.save()
			.then((savedMedia) => {
				const meta = AppResponse.getSuccessMeta();
				meta.message = lang.get('file').file_uploaded;
				return res.status(OK).json(AppResponse.format(meta, savedMedia));
			}, (err) => {
				return next(err);
			});
	}
}

export default MediaController;
