import Category from '../../api/resource/category/category.model';
import { NOT_FOUND } from '../../utils/status-codes';
import AppError from '../../classes/api/app-error';
import lang from '../../lang/index';
import Community from '../../api/community/community.model';
import User from '../../api/user/user.model';
import Discussion from '../../api/discussion/discussion.model';
import Post from '../../api/post/post.model';

export default async (req, res, next) => {
	const {categories, user, community, discussion, post} = req.body;
	if (categories) {
		const count = await Category.find({_id: {$in: categories}}).count();
		if (count !== categories.length) {
			const appError = new AppError(lang.get('resource').category_not_found, NOT_FOUND);
			return next(appError);
		}
	}
	if (community) {
		const found = await Community.findById(community);
		if (!found) {
			const appError = new AppError(lang.get('communities').not_found, NOT_FOUND);
			return next(appError);
		}
	}
	if (user) {
		const found = await User.findById(user);
		if (!found) {
			const appError = new AppError(lang.get('users').not_found, NOT_FOUND);
			return next(appError);
		}
	}
	if (discussion) {
		const found = await Discussion.findById(discussion);
		if (!found) {
			const appError = new AppError(lang.get('discussions').not_found, NOT_FOUND);
			return next(appError);
		}
	}
	if (post) {
		const found = await Post.findById(post);
		if (!found) {
			const appError = new AppError(lang.get('post').not_found, NOT_FOUND);
			return next(appError);
		}
	}
	return next();
};
