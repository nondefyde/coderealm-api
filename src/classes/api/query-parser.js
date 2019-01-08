import _ from 'underscore';

/**
 * The QueryParser class
 */
class QueryParser {
	/**
	 * @constructor
	 * @param {String} query This is a query object of the request
	 */
	constructor(query) {
		const excluded = ['per_page', 'page', 'limit', 'population',
			'api_key', 'nested', 'selection', 'sort', 'all', 'custom', 'includes'
		];
		this.obj = _.pick(query, ...excluded);
		if (query.population) {
			try {
				this._population = JSON.parse(query.population);
			} catch (e) {
				console.log(e);
			}
		}
		if (query.nested) {
			try {
				const nested = JSON.parse(query.nested);
				for (const key in nested) {
					if (nested.hasOwnProperty(key)) {
						query[key] = nested[key];
					}
				}
			} catch (e) {
				console.log(e);
			}
		}
		if (query.selection) {
			try {
				this._selection = JSON.parse(query.selection).join(' ');
			} catch (e) {
				console.log(e);
			}
		}
		if (query.includes) {
			try {
				const object = JSON.parse(query.includes);
				if (object['key'] && object['value']) {
					query[object['key']] = {$in: object['value']};
				}
			} catch (e) {
				console.log(e);
			}
		}
		query = _.omit(query, ...excluded);
		query = _.extend(query, {deleted: false});
		this._query = query;
		Object.assign(this, query); // TODO: Show emma
	}

	/**
	 * @return {Object} get the parsed query
	 */
	get getAll() {
		return this.obj['all'];
	}

	/**
	 * @return {Object} get the parsed query
	 */
	get query() {
		return this._query;
	}

	/**
	 * @return {Object} get the population object for query
	 */
	get population() {
		if (this._population) {
			return this._population;
		}
		return [];
	}

	/**
	 * @return {Object} get the population object for query
	 */
	get selection() {
		if (this._selection) {
			return this._selection;
		}
		return '';
	}

	/**
	 * @return {Object} get the population object for query
	 */
	get sort() {
		if (this._sort) {
			return this._sort;
		}
		return '-createdAt';
	}

	/**
	 * @return {Boolean} get the value for all data status
	 */
	get all() {
		return this._all;
	}
}

/**
 * @typedef Pagination
 */

export default QueryParser;
