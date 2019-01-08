/**
 * Resume Schema
 */
import mongoose, {Schema} from 'mongoose';
import BaseSchema from '../_core/base.model';

const MediaSchema = new BaseSchema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	file: {
		url: {type: String, required: true},
		key: {type: String, required: true},
	},
}, {timestamps: true});

/**
 * @typedef MediaSchema
 */
export default mongoose.model('Media', MediaSchema);
