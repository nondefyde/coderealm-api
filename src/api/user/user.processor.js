import _ from 'underscore';
import { addHourToDate, generateOTCode } from '../../utils/helper';
import User from './user.model';
import lang from '../../lang';
import { CONFLICT, FORBIDDEN, INTERNAL_SERVER_ERROR, NOT_FOUND, UNAUTHORIZED } from '../../utils/status-codes';
import AppError from '../../classes/api/app-error';
import config from 'config';
import axios from 'axios/index';
import crypto from 'crypto';
import EmailService from '../../classes/services/email-service';
import { UserEmail } from './user.email';

/**
 * The app processor class
 */
export class UserProcessor {
	/**
	 * @param {Object} obj The object properties
	 * @return {Promise<Object>}
	 */
	static async createUser(obj) {
		obj.verify_code_expiration = addHourToDate(1);
		const code = generateOTCode(4);
		obj = await _.extend(obj, {verification_code: code});
		const user = new User(obj);
		return user.save();
	}

	/**
	 * @param {Object} user The user property
	 * @param {Object} object The object properties
	 * @return {Object} returns the api error if user cannot be verified
	 */
	static userCanLogin(user, object) {
		if (!user) {
			return new AppError(lang.get('auth').auth_failed, NOT_FOUND);
		}
		let authenticated = object.password && user.password && user.comparePassword(object.password);
		if (!authenticated) {
			return new AppError(lang.get('auth').wrong_password, UNAUTHORIZED);
		}
		user.password = undefined;
	}

	/**
	 * @param {Object} user The user property
	 * @param {Object} object The object properties
	 * @return {Object} returns the api error if user cannot be verified
	 */
	static userCanVerify(user, object) {
		if (!user) {
			return new AppError(lang.get('auth').user_does_not_exists, NOT_FOUND);
		}
		else if (user.account_verified) {
			return new AppError(lang.get('auth').account_verified, CONFLICT);
		}
		if (!object.hash && !object.verification_code) {
			return new AppError(lang.get('auth').unauthorized_verification, FORBIDDEN);
		}
		if (object.hash) {
			const userHash = crypto.createHash('md5').update(user.verification_code).digest('hex');
			console.log('hash : ', userHash, object.hash);
			if (userHash !== object.hash) {
				return new AppError(lang.get('auth').unauthorized_reset, FORBIDDEN);
			}
		} else {
			if (!user.account_verified && user.verification_code !== object.verification_code) {
				return new AppError(lang.get('auth').incorrect_verification, FORBIDDEN);
			}
		}
		if (new Date() > user.verify_code_expiration) {
			return new AppError(lang.get('auth').expired_verification, FORBIDDEN);
		}
	}

	/**
	 * @param {Object} user The user property
	 * @param {Object} object The object properties
	 * @return {Object} returns the api error if user cannot be verified
	 */
	static userCanResetPassword(user, object) {
		if (!user) {
			return new AppError(lang.get('auth').user_does_not_exists, NOT_FOUND);
		}
		if (!(user.reset_code_expiration && user.password_reset_code)) {
			return new AppError(lang.get('auth').unauthorized_reset, FORBIDDEN);
		}
		const userHash = crypto.createHash('md5').update(user.password_reset_code).digest('hex');
		if ((object.hash && String(userHash) !== object.hash)
			|| (object.password_reset_code && object.password_reset_code !== user.password_reset_code)) {
			return new AppError(lang.get('auth').unauthorized_reset, FORBIDDEN);
		}
		if (new Date() > user.reset_code_expiration) {
			return new AppError(lang.get('auth').expired_password_reset, FORBIDDEN);
		}
	}

	/**
	 * @param {Object} user The user property
	 * @return {Object} returns the api error if user cannot be verified
	 */
	static verifyUser(user) {
		const updateObj = {verification_code: '', account_verified: true, active: true};
		_.extend(user, updateObj);
		return user.save();
	}

	/**
	 * @param {Object} user The user property
	 * @param {Object} object The object property
	 * @return {Object} returns the api error if user cannot be verified
	 */
	static resetUserPassword(user, object) {
		user.password = object.password;
		const updateObj = {reset_code_expiration: '', password_reset_code: '', password: object.password};
		_.extend(user, updateObj);
		return user.save();
	}

	/**
	 * @param {Object} user The user property
	 * @param {Object} object The object property
	 * @return {Object} returns the api error if user cannot be verified
	 */
	static updateUserPassword(user, object) {
		if (user.social_auth) {
			user.social_auth = false;
		}
		user.password = object.password;
		if (user.change_password) user.change_password = false;
		return user.save();
	}

	/**
	 * @param {String} type The type of social account
	 * @param {Object} obj The email to find
	 * @param {String} accessToken The access token for verification
	 * @param {String} social social auth type
	 * @return {Promise} The result of the find
	 */
	static loginSocial(type = 'FACEBOOK', obj, accessToken, social) {
		/* Todo : the social authentication endpoints are not verified properly should be done before production */
		try {
			const socialType = social.toUpperCase();
			let url = `${config.get('facebook.GraphUrl')}&access_token=${accessToken}`;
			if (type === socialType) {
				url = `${config.get('google.url')}?access_token=${accessToken}`;
			}
			return axios.get(url)
				.then(async (resp) => {
					const response = resp;
					if (type === socialType) {
						response.data.id = response.data.sub;
					}
					if (response.data && response.data.id) {
						if (response.data.id === obj.social_id) {
							_.extend(obj, {
								account_verified: true, active: true, social_id: response.data.id,
								social_auth: true, social_auth_type: socialType,
							});
							if (obj.email && response.data.email !== obj.email) {
								_.extend(obj, {
									account_verified: false
								});
							}
							if (response.data.name) {
								const name = response.data.name.split(' ');
								const lastName = name[0] ? name[0] : '';
								const firstName = name[1] ? name[1] : '';
								_.extend(obj, {last_name: lastName, first_name: firstName});
							}
							if (response.data.last_name) {
								obj.last_name = response.data.last_name;
							}
							if (response.data.first_name) {
								obj.first_name = response.data.first_name;
							}
							const user = await new User(obj);
							if (!user.account_verified) {
								user.verify_code_expiration = addHourToDate(1);
								user.verification_code = generateOTCode(4);
								await EmailService.sendEmail(UserEmail.verifyCode(user, obj.verify_redirect_url));
							}
							return user.save();
						} else {
							throw new AppError(lang.get('auth').social_auth_unauthorized, UNAUTHORIZED);
						}
					} else {
						throw new AppError(lang.get('auth').auth_token, FORBIDDEN);
					}
				}, (err) => {
					if (err.response && err.response.data && err.response.data.error) {
						if (err.response.data.error) {
							throw new AppError(err.response.data.error.message, FORBIDDEN);
						} else if (err.response.data.error_description) {
							throw new AppError(err.response.data.error_description, FORBIDDEN);
						}
					}
					throw new AppError(lang.get('auth').auth_token, FORBIDDEN);
				});
		} catch (e) {
			// console.log('exception : ', e);
			throw new AppError(lang.get('error').server, INTERNAL_SERVER_ERROR);
		}
	}
}
