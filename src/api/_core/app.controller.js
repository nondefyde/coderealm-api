import _ from 'underscore';
import lang from '../../lang/index';
import BaseController from './base.controller';
import { CONFLICT, CREATED, NOT_FOUND, OK } from '../../utils/status-codes';
import QueryParser from '../../classes/api/query-parser';
import AppError from '../../classes/api/app-error';
import { AppProcessor } from './/app.processor';
import { VALIDATE_CREATE, VALIDATE_UPDATE } from './/validation.key';
import Pagination from '../../classes/api/pagination';

/**
 * The App controller class where other controller inherits or
 * overrides pre defined and existing properties
 */
class AppController extends BaseController {
	/**
	 * @param {Model} model The default model object
	 * for the controller. Will be required to create
	 * an instance of the controller
	 */
	constructor(model = null) {
		super(model);
		this.id = this.id.bind(this);
		this.create = this.create.bind(this);
		this.find = this.find.bind(this);
		this.findOne = this.findOne.bind(this);
		this.update = this.update.bind(this);
		this.delete = this.delete.bind(this);
		this.softDelete = this.softDelete.bind(this);
	}

	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 * @param {String} id The id from the url parameter
	 * @return {Object} res The response object
	 */
	async id(req, res, next, id) {
		const queryParser = new QueryParser(Object.assign({}, req.query));
		try {
			const object = await AppProcessor.getObject(this.model, id, queryParser);
			if (object) {
				req.object = object;
				return next();
			}
			const appError = new AppError(this.lang.not_found, NOT_FOUND);
			return next(appError);
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
	async create(req, res, next) {
		const queryParser = new QueryParser(Object.assign({}, req.query));
		const obj = await AppProcessor.prepareBodyObject(req);
		const validate = AppProcessor.validate(this.model, VALIDATE_CREATE, obj,
			lang.get('error').inputs);
		if (validate) {
			return next(validate);
		}
		try {
			const foundObject = await AppProcessor.retrieveExistingResource(this.model, obj);
			if (foundObject) {
				const returnIfFound = this.model.returnIfFound();
				if (returnIfFound) {
					const response = await AppProcessor.getSimpleResponse(this.model,
						foundObject, CREATED, this.lang.create, queryParser);
					return res.status(OK).json(response);
				}
				const messageObj = this.model.uniques().map(m => ({[m]: `${m} must be unique`}));
				throw new AppError(lang.get('error')
					.resource_already_exist, CONFLICT, messageObj);
			} else {
				let object = new this.model(obj);
				object = await object.save();
				const response = await AppProcessor.getSimpleResponse(this.model, object, CREATED, this.lang.create, queryParser);
				return res.status(OK).json(response);
			}
		} catch (err) {
			return next(err);
		}
	}

	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @return {Object} The response object
	 */
	async findOne(req, res) {
		const queryParser = new QueryParser(Object.assign({}, req.query));
		let object = req.object;
		const response = await AppProcessor.getSimpleResponse(this.model, object, OK, '', queryParser);
		return res.status(OK).json(response);
	}

	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 * @return {Object} The response object
	 */
	async find(req, res, next) {
		const queryParser = new QueryParser(Object.assign({}, req.query));
		const pagination = new Pagination(req.originalUrl);
		const query = AppProcessor.buildModelQuery(this.model, pagination, queryParser);
		try {
			const [objects, count] = await Promise.all([
				query.select(queryParser.selection).exec(),
				this.model.count(queryParser.query).exec(),
			]);
			const response = await AppProcessor.getPaginatedResponseObject(this.model, objects, OK,
				'', count, pagination, queryParser);
			return res.status(OK).json(response);
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
	async update(req, res, next) {
		const queryParser = new QueryParser(Object.assign({}, req.query));
		let object = req.object;
		const update = req.body;
		const validate = AppProcessor.validate(this.model, VALIDATE_UPDATE, update,
			lang.get('error').no_update_input);
		if (validate) {
			return next(validate);
		}
		_.extend(object, update);
		try {
			object = await object.save();
			const response = await AppProcessor.getSimpleResponse(this.model, object, OK, this.lang.update, queryParser);
			return res.status(OK).json(response);
		} catch (err) {
			return next(err);
		}
	}

	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 * @return {Object} The response object
	 */
	async softDelete(req, res, next) {
		let object = req.object;
		_.extend(object, {deleted: true});
		try {
			object = await object.save();
			const response = await AppProcessor.getSimpleResponse(this.model, {_id: object._id}, OK, this.lang.deleted);
			return res.status(OK).json(response);
		} catch (err) {
			return next(err);
		}
	}

	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 * @return {Object} The response object
	 */
	async delete(req, res, next) {
		let object = req.object;
		try {
			object = await object.remove();
			const response = await AppProcessor.getSimpleResponse(this.model, {_id: object._id}, OK, this.lang.deleted);
			return res.status(OK).json(response);
		} catch (err) {
			return next(err);
		}
	}
}

export default AppController;

