import _ from 'underscore';
import AppResponse from '../../classes/api/app-response';
import AppError from '../../classes/api/app-error';
import { BAD_REQUEST } from '../../utils/status-codes';

/**
 * The app processor class
 */
export class AppProcessor {
	/**
	 * @param {Object} model The schema model
	 * @param {String} id the id of the resource to find
	 * @param {Object} queryParser The query parser
	 * @return {Promise<Object>}
	 */
	static async getObject(model, id, queryParser) {
		let query = model.findOne({_id: id, deleted: false});
		if (queryParser.population) {
			query = query.populate(queryParser.population);
		}
		return query.exec();
	}

	/**
	 * @param {Object} model The schema model
	 * @param {Object} object The schema model
	 * @param {Integer} code The schema model
	 * @param {Object} meta The query parser
	 * @param {String} message the id of the resource to find
	 * @param {Object} queryParser The query parser
	 * @return {Promise<Object>}
	 */
	static async getResponseObject(model, object, code, meta = AppResponse.getSuccessMeta(), message = 'Operation was successful', queryParser = null) {
		_.extend(meta, {status_code: code});
		if (queryParser && queryParser.population) {
			object = await model.populate(object, queryParser.population);
		}
		if (message) {
			meta.message = message;
		}
		return AppResponse.format(meta, object);
	}

	/**
	 * @param {Object} model The schema model
	 * @param {Object} object The schema model
	 * @param {Integer} code The schema model
	 * @param {String} message The response message
	 * @param {Object} queryParser The query parser
	 * @return {Promise<Object>}
	 */
	static async getSimpleResponse(model, object, code, message, queryParser = null) {
		const meta = AppResponse.getSuccessMeta();
		_.extend(meta, {status_code: code});
		if (queryParser && queryParser.population) {
			object = await model.populate(object, queryParser.population);
		}
		if (message) {
			meta.message = message;
		}
		return AppResponse.format(meta, object);
	}

	/**
	 * @param {Object} model The schema model
	 * @param {Object} object The schema model
	 * @param {Integer} code The schema model
	 * @param {String} message the id of the resource to find
	 * @param {Integer} count The total number of query
	 * @param {Object} pagination The pagination object
	 * @param {Object} queryParser The query parser
	 * @return {Promise<Object>}
	 */
	static async getPaginatedResponseObject(model, object, code, message = 'Operation was successful', count, pagination, queryParser) {
		const meta = AppResponse.getSuccessMeta();
		_.extend(meta, {status_code: code});
		if (queryParser && queryParser.population) {
			object = await model.populate(object, queryParser.population);
		}
		if (message) {
			meta.message = message;
		}
		if (!queryParser.getAll) {
			pagination.totalCount = count;
			if (pagination.morePages(count)) {
				pagination.next = pagination.current + 1;
			}
			meta.pagination = pagination.done();
		}
		return AppResponse.format(meta, object);
	}

	/**
	 * @param {Object} model The schema model
	 * @param {Object} pagination The pagination object
	 * @param {Object} queryParser The query parser
	 * @return {Object}
	 */
	static buildModelQuery(model, pagination, queryParser = null) {
		let query = model.find(queryParser.query);
		if (queryParser.population) {
			query = query.populate(queryParser.population);
		}
		if (!queryParser.getAll) {
			query = query.skip(pagination.skip)
				.limit(pagination.perPage)
				.sort(
					(pagination && pagination.sort) ?
						Object.assign(pagination.sort, {createdAt: -1}) : '-createdAt');
		}
		return query;
	}

	/**
	 * @param {Object} model The schema model
	 * @param {String} type The type of validation to perform
	 * @param {Object} body The object to validate
	 * @param {String} error The object to validate
	 * @return {Object}
	 */
	static validate(model, type, body, error) {
		const {validator, validated} = model.validations(type, body);
		if (!validated) {
			return new AppError(error, BAD_REQUEST, validator.errors.all());
		}
		return null;
	}

	/**
	 * @param {Object} req The request object
	 * @return {Promise<Object>}
	 */
	static async prepareBodyObject(req) {
		let obj = req.body;
		if (req.userId) {
			const user = req.userId;
			await _.extend(obj, {user, owner: user, created_by: user});
		}
		return obj;
	}

	/**
	 * @param {Object} model The model object
	 * @param {Object} obj The request object
	 * @return {Promise<Object>}
	 */
	static async retrieveExistingResource(model, obj) {
		if (model.uniques() && !_.isEmpty(model.uniques())) {
			const uniqueKeys = model.uniques();
			const query = {};
			for (const key of uniqueKeys) {
				query[key] = obj[key];
			}
			const found = await model.findOne({...query, deleted: false, active: true});
			if (found) {
				return found;
			}
		}
		return null;
	}
}
