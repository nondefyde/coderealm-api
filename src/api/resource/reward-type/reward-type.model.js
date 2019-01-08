import mongoose from 'mongoose';
import BaseSchema from '../../_core/base.model';
import validations from './reward-type.validation';

/**
 * Experience type Schema
 */
const RewardTypeSchema = new BaseSchema({
	name: {
		type: String,
		// lowercase: true,
		required: true,
	},
	active: {
		type: Boolean,
		default: true,
	},
	deleted: {
		type: Boolean,
		default: false,
		select: false,
	},
}, {
	timestamps: true,
});

/**
 * @return {Object} The validator object with the specified rules.
 */
RewardTypeSchema.statics.uniques = () => ['name'];
/**
 *
 * @param {String} type
 * @param {Object} body
 * @return {Object} The validator object with the specified rules.
 */
RewardTypeSchema.statics.validations = (type, body) => {
	return validations[type](body);
};

/**
 *
 * @return {Object} The validator object with the specified rules.
 */
RewardTypeSchema.statics.returnIfFound = () => {
	return true;
};
/**
 * @typedef CategorySchema
 */
export default mongoose.model('RewardType', RewardTypeSchema);
