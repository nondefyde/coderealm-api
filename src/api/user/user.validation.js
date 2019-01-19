import Validator from 'validatorjs';
import config from 'config';

/**
 * The app processor class
 */
export default {
	/**
	 * @param {Object} body The object to validate
	 * @return {Object} Validator
	 */
	create: (body) => {
		const rules = {
			email: 'required|email',
			password: 'required|min:6',
			verify_redirect_url: 'required'
		};
		if (`${config.util.getEnv('NODE_ENV')}` === 'production') {
			rules['verify_redirect_url'] = 'required|url';
		}
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

	/**
	 * @param {Object} obj The object to perform validation on
	 * @return {Validator} The validator object with the specified rules.
	 */
	social: (obj) => {
		const rules = {
			email: 'email',
			social_id: 'required',
			access_token: 'required'
		};
		const validator = new Validator(obj, rules);
		return {
			validator,
			validated: validator.passes()
		};
	},

	/**
	 * @param {Object} obj The object to perform validation on
	 * @return {Validator} The validator object with the specified rules.
	 */
	authenticate: (obj) => {
		let rules = {
			email: 'required',
		};
		validateUserAuth(obj, rules);
		const validator = new Validator(obj, rules);
		return {
			validator,
			validated: validator.passes()
		};
	},

	/**
	 * @param {Object} obj The object to perform validation on
	 * @return {Validator} The validator object with the specified rules.
	 */
	login: (obj) => {
		const rules = {
			email: 'required',
			password: 'required|min:6'
		};
		validateUserAuth(obj, rules);
		const validator = new Validator(obj, rules);
		return {
			validator,
			validated: validator.passes()
		};
	},
	/**
	 * @param {Object} obj The object to perform validation on
	 * @return {Validator} The validator object with the specified rules.
	 */
	verifyLink: (obj) => {
		const rules = {
			email: 'required|email',
			hash: 'required',
		};
		const validator = new Validator(obj, rules, {
			'email.email': 'Not a valid email address',
			'email.required': 'Your email is required',
			'hash.required': 'The hash is required',
		});
		return {
			validator,
			validated: validator.passes()
		};
	},

	/**
	 * @param {Object} obj The object to perform validation on
	 * @return {Validator} The validator object with the specified rules.
	 */
	resendVerification: (obj) => {
		const rules = {
			verify_redirect_url: 'required',
		};
		if (`${config.util.getEnv('NODE_ENV')}` === 'production') {
			rules['verify_redirect_url'] = 'required|url';
		}
		const validator = new Validator(obj, rules);
		return {
			validator,
			validated: validator.passes()
		};
	},

	/**
	 * @param {Object} obj The object to perform validation on
	 * @return {Validator} The validator object with the specified rules.
	 */
	resetPassword: (obj) => {
		let rules = {
			email: 'required',
			redirect_url: 'required',
		};
		validateUserAuth(obj, rules);
		rules['redirect_url'] = 'required|url';
		if (`${config.util.getEnv('NODE_ENV')}` !== 'production') {
			rules['redirect_url'] = 'required';
		}
		const validator = new Validator(obj, rules, {
			'email.email': 'Not a valid email address',
			'email.required': 'Your email is required',
			'redirect_url.required': 'The redirect_url is required',
			'redirect_url.url': 'The redirect_url must be a valid uri',
		});
		return {
			validator,
			validated: validator.passes()
		};
	},

	/**
	 * @param {Object} obj The object to perform validation on
	 * @return {Validator} The validator object with the specified rules.
	 */
	updatePassword: (obj) => {
		let rules = {
			email: 'required|email',
			hash: 'required_if:password_reset_code,null',
			password_reset_code: 'required_if:hash,null',
			password: 'required|min:6',
		};
		if (!obj.hash && !obj.password_reset_code) {
			rules['hash'] = 'required';
			if (!obj.hash) {
				obj.hash = null;
			}
			if (!obj.password_reset_code) {
				obj.password_reset_code = null;
			}
		}
		const validator = new Validator(obj, rules, {
			'email.email': 'Not a valid email address',
			'email.required': 'Your email is required',
		});
		return {
			validator,
			validated: validator.passes()
		};
	},

	/**
	 * @param {Object} obj The object to perform validation on
	 * @return {Validator} The validator object with the specified rules.
	 */
	changePassword: (obj) => {
		const rules = {
			current_password: 'required|min:6',
			password: 'required|min:6',
		};
		const validator = new Validator(obj, rules, {
			'current_password.required': 'Your current password is required',
			'current_password.min': 'Your current password must be at least 6 characters!',
			'password.required': 'Your new password is required',
			'password.min': 'New password must be at least 6 characters!',
		});
		return {
			validator,
			validated: validator.passes()
		};
	}
};

/**
 * @param {Object} object payload
 * @param {Object}  rule validation object
 * @return {{}}
 */
const validateUserAuth = (object, rule) => {
	const obj = {...object};
	if (!obj.email && !obj.username) {
		rule['email'] = 'required';
	} else {
		if (!obj.email) {
			obj.email = null;
		}
		if (!obj.username) {
			obj.username = null;
		}
	}
	return obj;
};
