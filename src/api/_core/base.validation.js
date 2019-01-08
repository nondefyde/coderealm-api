import Validator from 'validatorjs';

/**
 * The app processor class
 */
export default {
	/**
	 * @param {Object} body The object to validate
	 * @return {Object} Validator
	 */
	create: (body) => {
		const rules = {};
		const validator = new Validator(body, rules);
		return {
			validator,
			validated: validator.passes()
		};
	},

	/**
	 * @param {Object} body The object to validate
	 * @return {Object} Validator
	 */
	update: (body) => {
		const rules = {};
		const validator = new Validator(body, rules);
		return {
			validator,
			validated: validator.passes()
		};
	},
};
