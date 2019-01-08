/**
 * The Base controller class where other controller inherits or
 * overrides pre defined and existing properties
 */
import lang from '../../lang/index';
import BaseController from '../_core/base.controller';
import AppError from '../../classes/api/app-error';
import { addHourToDate, generateOTCode, signToken } from '../../utils/helper';
import { CONFLICT, CREATED, NOT_FOUND, OK } from '../../utils/status-codes';
import EmailService from '../../classes/services/email-service';
import { UserEmail } from '../user/user.email';
import AppResponse from '../../classes/api/app-response';
import { UserProcessor } from '../user/user.processor';
import { AppProcessor } from '../_core/app.processor';
import Q from 'q';
import {
	VALIDATE_AUTHENTICATION,
	VALIDATE_CHANGE_PASSWORD,
	VALIDATE_CREATE,
	VALIDATE_LOGIN,
	VALIDATE_RESEND_VERIFICATION,
	VALIDATE_RESET_PASSWORD,
	VALIDATE_SOCIAL,
	VALIDATE_UPDATE_PASSWORD,
	VALIDATE_VERIFY_LINK,
} from '../_core/validation.key';

/**
 * The Auth Controller
 */
class AuthController extends BaseController {
	/**
	 * @param {Model} name The name property is inherited
	 * from the parent
	 */
	constructor(name) {
		super(name);
		this.socialSignIn = this.socialSignIn.bind(this);
		this.login = this.login.bind(this);
		this.register = this.register.bind(this);
		this.verifyLink = this.verifyLink.bind(this);
		this.sendVerificationCode = this.sendVerificationCode.bind(this);
		this.resetPassword = this.resetPassword.bind(this);
		this.updatePassword = this.updatePassword.bind(this);
		this.changePassword = this.changePassword.bind(this);
		this.authenticate = this.authenticate.bind(this);
	}

	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 * @return {Object} res The response object
	 */
	async socialSignIn(req, res, next) {
		const obj = await AppProcessor.prepareBodyObject(req);
		const validate = AppProcessor.validate(this.model, VALIDATE_SOCIAL, obj, lang.get('error').inputs);
		if (validate instanceof AppError) {
			return next(validate);
		}
		const social = req.params.social;
		try {
			let user = await this.model.findOne({social_id: obj.social_id});
			if (!user) {
				if (!obj.username) {
					throw new AppError(lang.get('auth').username_required, CONFLICT);
				}
				user = this.model(obj);
			}
			user = await UserProcessor.loginSocial(this.model.types()[1].value, user, obj.access_token, social);
			const meta = AppResponse.getSuccessMeta();
			meta.token = signToken({userId: user._id});
			const response = await AppProcessor.getResponseObject(this.model, user, CREATED, meta);
			return res.status(OK).json(response);
		} catch (e) {
			return next(e);
		}
	}

	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 * @return {Object} res The response object
	 */
	async authenticate(req, res, next) {
		const obj = await AppProcessor.prepareBodyObject(req);
		const validate = AppProcessor.validate(this.model, VALIDATE_AUTHENTICATION, obj, lang.get('error').inputs);
		if (validate instanceof AppError) {
			return next(validate);
		}
		try {
			const user = await this.model.findOne({
				$or: [{email: obj.email}, {username: obj.username}]
			}).select('+password');
			const response = await AppProcessor.getSimpleResponse(this.model, {
				authenticated: true,
				exist: user != null
			}, CREATED, '');
			return res.status(OK).json(response);
		} catch (e) {
			next(e);
		}
	}

	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 * @return {Object} res The response object
	 */
	async login(req, res, next) {
		const obj = await AppProcessor.prepareBodyObject(req);
		const validate = AppProcessor.validate(this.model, VALIDATE_LOGIN, obj, lang.get('error').inputs);
		if (validate instanceof AppError) {
			return next(validate);
		}
		try {
			const user = await this.model.findOne({
				$or: [{email: obj.email}, {username: obj.username}]
			}).select('+password');
			const loginError = UserProcessor.userCanLogin(user, obj);
			if (loginError) {
				throw loginError;
			}
			const meta = AppResponse.getSuccessMeta();
			meta.token = signToken({userId: user._id});
			const response = await AppProcessor.getResponseObject(this.model, user, CREATED, meta, '');
			return res.status(OK).json(response);
		} catch (e) {
			next(e);
		}
	}

	/**
	 * @param {Object} req The request object
	 * @param {Object} res The response object
	 * @param {callback} next The callback to the next program handler
	 * @return {Object} res The response object
	 */
	async register(req, res, next) {
		const obj = await AppProcessor.prepareBodyObject(req);
		const validate = AppProcessor.validate(this.model, VALIDATE_CREATE, obj, lang.get('error').inputs);
		if (validate instanceof AppError) {
			return next(validate);
		}
		try {
			let [emailExist, usernameExist] = await Q.all([
				this.model.findOne({email: obj.email}),
				this.model.findOne({username: obj.username})
			]);
			if (emailExist) {
				throw new AppError(lang.get('auth').email_exists, CONFLICT);
			}
			if (usernameExist) {
				throw new AppError(lang.get('auth').username_exists, CONFLICT);
			}
			const user = await UserProcessor.createUser(obj);
			await EmailService.sendEmail(UserEmail.verify(user, obj.verify_redirect_url));
			const meta = AppResponse.getSuccessMeta();
			meta.token = signToken({userId: user._id});
			const response = await AppProcessor.getResponseObject(this.model, user, CREATED, meta, '');
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
	async verifyLink(req, res, next) {
		const obj = await AppProcessor.prepareBodyObject(req);
		const validate = AppProcessor.validate(this.model, VALIDATE_VERIFY_LINK, obj, lang.get('error').inputs);
		if (validate instanceof AppError) {
			return next(validate);
		}
		try {
			let user = await this.model.findOne({
				email: obj.email
			}).select('+password').exec();
			const verificationError = UserProcessor.userCanVerify(user, obj);
			if (verificationError) {
				throw verificationError;
			}
			user = await UserProcessor.verifyUser(user);
			const response = await AppProcessor.getResponseObject(this.model, user, OK);
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
	async sendVerificationCode(req, res, next) {
		const obj = await AppProcessor.prepareBodyObject(req);
		const validate = AppProcessor.validate(this.model, VALIDATE_RESEND_VERIFICATION, obj, lang.get('error').inputs);
		if (validate instanceof AppError) {
			return next(validate);
		}
		try {
			let user = await this.model.findById(obj.user);
			if (!user) {
				throw new AppError(lang.get('auth').user_does_not_exists, NOT_FOUND);
			}
			else if (user.account_verified) {
				throw new AppError(lang.get('auth').account_verified, CONFLICT);
			}
			user.verify_code_expiration = addHourToDate(1);
			user.verification_code = generateOTCode(4);
			user = await user.save();
			await EmailService.sendEmail(UserEmail.verifyCode(user, obj.verify_redirect_url));
			const response = await AppProcessor.getResponseObject(this.model, user, CREATED);
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
	async resetPassword(req, res, next) {
		const obj = await AppProcessor.prepareBodyObject(req);
		const validate = AppProcessor.validate(this.model, VALIDATE_RESET_PASSWORD, obj, lang.get('error').inputs);
		if (validate instanceof AppError) {
			return next(validate);
		}
		try {
			let user = await this.model.findOne({
				$or: [{email: obj.email}, {username: obj.username}]
			});
			if (!user) {
				throw new AppError(lang.get('auth').user_does_not_exists, NOT_FOUND);
			}
			user.password_reset_code = generateOTCode(4);
			user.reset_code_expiration = addHourToDate(1);
			user = await user.save();
			await EmailService.sendEmail(UserEmail.resetPassword(user, obj.redirect_url));
			const response = await AppProcessor.getResponseObject(this.model, {email: user.email}, CREATED);
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
	async updatePassword(req, res, next) {
		const obj = await AppProcessor.prepareBodyObject(req);
		const validate = AppProcessor.validate(this.model, VALIDATE_UPDATE_PASSWORD, obj, lang.get('error').inputs);
		if (validate instanceof AppError) {
			return next(validate);
		}
		try {
			let user = await this.model.findOne({email: obj.email}).select('+password').exec();
			const canResetPasswordError = UserProcessor.userCanResetPassword(user, obj);
			if (canResetPasswordError) {
				throw canResetPasswordError;
			}
			await UserProcessor.resetUserPassword(user, obj);
			const response = await AppProcessor.getResponseObject(this.model, {success: true}, CREATED);
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
	async changePassword(req, res, next) {
		const obj = await AppProcessor.prepareBodyObject(req);
		const validate = AppProcessor.validate(this.model, VALIDATE_CHANGE_PASSWORD, obj, lang.get('error').inputs);
		if (validate instanceof AppError) {
			return next(validate);
		}
		try {
			let user = await this.model.findById(obj.user).select('+password').exec();
			if (!user) {
				throw new AppError(lang.get('auth').user_does_not_exists, NOT_FOUND);
			}
			else if (!user.social_auth && !user.comparePassword(obj.current_password)) {
				throw new AppError(lang.get('auth').incorrect_password, NOT_FOUND);
			}
			user = await UserProcessor.updateUserPassword(user, obj);
			const response = await AppProcessor.getResponseObject(this.model, user, CREATED);
			return res.status(OK).json(response);
		} catch (err) {
			return next(err);
		}
	}
}

export default AuthController;
