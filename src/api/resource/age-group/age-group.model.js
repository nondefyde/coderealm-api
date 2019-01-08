import mongoose from 'mongoose';
import BaseSchema from '../../_core/base.model';
import validations from './age-group.validation';

/**
 * Experience type Schema
 */
const AgeGroupSchema = new BaseSchema({
	name: {
		type: String,
		lowercase: true,
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
AgeGroupSchema.statics.uniques = () => ['name'];
/**
 *
 * @param {String} type
 * @param {Object} body
 * @return {Object} The validator object with the specified rules.
 */
AgeGroupSchema.statics.validations = (type, body) => {
	return validations[type](body);
};

/**
 *
 * @return {Object} The validator object with the specified rules.
 */
AgeGroupSchema.statics.returnIfFound = () => {
	return true;
};
/**
 * @typedef CategorySchema
 */
export default mongoose.model('AgeGroup', AgeGroupSchema);
