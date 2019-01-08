import Comment from '../../api/comment/comment.model';
import mongoose from 'mongoose';

export default async (req, res, next) => {
	let {parent} = req.body;
	if (parent) {
		const commentId = mongoose.Types.ObjectId();
		const comment = await Comment.findById(parent);
		if (comment) {
			comment.replies.addToSet(commentId);
			await comment.save();
			req.body._id = commentId;
		}
	}
	return next();
};
