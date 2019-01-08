/* eslint no-undef: 0 */
import AppController from '../_core/app.controller';
import AppError from '../../classes/api/app-error';
import {BAD_REQUEST, OK} from '../../utils/status-codes';
import config from 'config';
import _ from 'underscore';
import lang from '../../lang/index';
import AppResponse from '../../classes/api/app-response';

const s3ImageLink = config.get('aws.s3Link');

/**
 * The Base controller class where other controller inherits or
 * overrides pre defined and existing properties
 */
class UserController extends AppController {
	/**
	 * @param {Model} name The name property is inherited
	 * from the parent
	 */
	constructor(name) {
		super(name);
		this.findUserByEmail = this.findUserByEmail.bind(this);
		this.upload = this.upload.bind(this);
		this.currentUser = this.currentUser.bind(this);
		this.updateMe = this.updateMe.bind(this);
	}

	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 * @return {void}
	 */
	create(req, res, next) {
		throw new Error('Operation failed!');
	}

	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 * @return {void}
	 */
	async updateMe(req, res, next) {
		const user = await this.model.findById(req.userId);
		req.object = user;
		super.update(req, res, next);
	}

	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 * @return {Object}
	 */
	findUserByEmail(req, res, next) {
		const email = req.params.email;
		if (!email) {
			const appError = new AppError(this.trans.get('no_file_uploaded'), BAD_REQUEST);
			return next(appError);
		}
		_.extend(req.query, {email});
		return super.find(req, res, next);
	}

	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 * @return {Object} res The response object
	 */
	async upload(req, res, next) {
		if (!req.file || _.isEmpty(req.file)) {
			const appError = new AppError(lang.get('file').no_file_uploaded, BAD_REQUEST);
			return next(appError);
		}
		const file = req.file;
		console.log('req.body : ', req.body);
		const fileUploaded = {
			url: file.location,
			key: file.key,
			mime_type: file.mimetype,
		};
		const user = req.object;
		user[req.body.type] = fileUploaded;
		try {
			const savedUser = await user.save();
			const meta = AppResponse.getSuccessMeta();
			meta.message = this.lang.avatar;
			return res.status(OK).json(AppResponse.format(meta, savedUser));
		} catch (err) {
			return next(err);
		}
	}

	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 * @return {Object} res The response object
	 */
	async currentUser(req, res, next) {
		const meta = AppResponse.getSuccessMeta();
		const user = await this.model.findById(req.userId);
		return res.status(OK).json(AppResponse.format(meta, user));
	}
}

export default UserController;
