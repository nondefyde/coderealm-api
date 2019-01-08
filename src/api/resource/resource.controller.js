import _ from 'underscore';
import Q from 'q';
import { OK } from '../../utils/status-codes';
import AppController from '../_core/app.controller';
import AppResponse from '../../classes/api/app-response';
import APP_RESOURCES from './index';
import lang from '../../lang';

/**
 * The App controller class where other controller inherits or
 * overrides pre defined and existing properties
 */
class ResourceController extends AppController {
	/**
	 * @param {Model} model The default model object
	 * for the controller. Will be required to create
	 * an instance of the controller
	 */
	constructor(model = null) {
		super(model);
		this.lang = lang.get('resource');
		this.list = this.list.bind(this);
	}

	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 * @param {String} id The id from the url parameter
	 */
	id(req, res, next, id) {
		this.model = req.resource.model;
		super.id(req, res, next, id);
	}

	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 */
	async create(req, res, next) {
		this.model = req.resource.model;
		super.create(req, res, next);
	}

	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 */
	find(req, res, next) {
		this.model = req.resource.model;
		super.find(req, res, next);
	}

	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 * @return {Object} res The response object
	 */
	async list(req, res, next) {
		const meta = AppResponse.getSuccessMeta();
		const resources = _.map(APP_RESOURCES, (resource) => {
			return {
				name: resource.resource_name.replace(/-/g, ' '),
				url: resource.resource_name
			};
		});
		return res.status(OK).json(AppResponse.format(meta, resources));
	}

	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 * @return {Object} res The response object
	 */
	async all(req, res, next) {
		const meta = AppResponse.getSuccessMeta();
		const resources = _.map(APP_RESOURCES, (resource) => {
			return Q.all([resource.model.find(), resource.resource_name.replace(/-/g, '_')]);
		});

		try {
			const result = await Q.all(resources);
			const objects = {};
			result.forEach((object) => {
				// const obj = {};
				// obj[object[1]] = object[0];
				objects[object[1]] = object[0];
				// return obj;
			});
			return res.status(OK).json(AppResponse.format(meta, objects));
		} catch (err) {
			return next(err);
		}
	}
}

export default ResourceController;
