/**
 * User Schema
 */
import bcrypt from 'bcrypt-nodejs';
import BaseSchema from '../_core/base.model';
import Enum from 'enum';
import validations from './user.validation';
import mongoose from 'mongoose';

const UserModel = new BaseSchema({
	email: {
		type: String,
		unique: true,
		lowercase: true,
		index: true,
	},
	username: {
		type: String,
		unique: true,
		lowercase: true,
		index: true,
	},
	password: {
		type: String,
		select: false,
	},
	first_name: {
		type: String,
	},
	last_name: {
		type: String,
	},
	mobile: {
		type: String,
	},
	gender: {
		type: String,
	},
	dob: {
		type: String,
	},
	avatar: {
		url: {type: String},
		key: {type: String},
		mime_type: {type: String},
	},
	banner: {
		url: {type: String},
		key: {type: String},
		mime_type: {type: String},
	},
	account_verified: {
		type: Boolean,
		default: false,
	},
	verification_code: {
		type: String,
	},
	active: {
		type: Boolean,
		default: false,
	},
	social_auth: {
		type: Boolean,
	},
	social_auth_type: {
		type: String,
		enum: ['FACEBOOK', 'GOOGLE'],
	},
	social_id: {
		type: String,
	},
	password_reset: {
		type: Boolean,
		default: false,
	},
	password_reset_code: {
		type: String,
	},
	reset_code_expiration: {
		type: Date,
	},
	verify_code_expiration: {
		type: Date,
	},
	change_password: {
		type: Boolean,
		default: false,
	},
	is_admin: {
		type: Boolean,
		default: false,
	},
	deleted: {
		type: Boolean,
		default: false,
		select: false,
	},
}, {
	timestamps: true,
	toObject: {
		virtuals: true
	},
	toJSON: {
		virtuals: true
	}
});

UserModel.pre('save', function (next) {
	const user = this;
	if (!user.isModified('password')) return next();
	user.password = bcrypt.hashSync(user.password);
	next();
});

/**
 * @param {String} password The password to compare against
 * @return {Boolean} The result of the comparison
 */
UserModel.methods.comparePassword = function (password) {
	return bcrypt.compareSync(password, this.password);
};

/**
 * @param {String} token The password to compare against
 * @return {Boolean} The result of the comparison
 */
UserModel.methods.compareVerificationToken = function (token) {
	return bcrypt.compareSync(this.verification_code, token);
};

/**
 * @param {String} token The password to compare against
 * @return {Boolean} The result of the comparison
 */
UserModel.methods.compareResetPasswordToken = function (token) {
	return bcrypt.compareSync(this.password_reset_code, token);
};

/**
 *
 * @param {String} type
 * @param {Object} body
 * @return {Object} The validator object with the specified rules.
 */
UserModel.statics.validations = (type, body) => {
	return validations[type](body);
};

/**
 * @return {Object} The validator object with the specified rules.
 */
UserModel.statics.uniques = () => ['email', 'username'];

/**
 * @return {Object} The validator object with the specified rules.
 */
UserModel.statics.types = () => {
	return new Enum({
		0: 'FACEBOOK',
		1: 'GOOGLE',
	});
};
/**
 * @typedef UserModel
 */
export default mongoose.model('User', UserModel);
