import PollOption from '../../api/poll-option/poll-option.model';
// import RewardOption from '../../api/reward-option/reward-option.model';
import Reward from '../../api/reward/reward.model';
import Poll from '../../api/poll/poll.model';
import mongoose from 'mongoose';
import lang from '../../lang';
import { AppProcessor } from '../../api/_core/app.processor';
import { VALIDATE_CREATE } from '../../api/_core/validation.key';

export default async (req, res, next) => {
	let {options, rewards, post_rewards, poll} = req.body;
	if (options && Array.isArray(options)) {
		const pollId = mongoose.Types.ObjectId();
		const user = req.userId;
		options = options.map(o => ({...o, poll: pollId, user}));
		const created = await PollOption.create([...options]);
		const ids = created.map(o => o._id);
		req.body._id = pollId;
		req.body.poll_options = [...ids];
	}
	if (rewards && Array.isArray(rewards)) {
		const postId = mongoose.Types.ObjectId();
		const user = req.userId;
		post_rewards = rewards.map(o => ({...o, post: postId, user, active: true, deleted: false}));
		const created = await Reward.create([...post_rewards]);
		const ids = created.map(o => o._id);
		req.body._id = postId;
		req.body.rewards = [...ids];
	}
	if (post_rewards && Array.isArray(post_rewards)) {
		const postId = mongoose.Types.ObjectId();
		const user = req.userId;
		post_rewards = post_rewards.map(o => ({...o, post: postId, user, active: true, deleted: false}));
		const created = await Reward.create([...post_rewards]);
		const ids = created.map(o => o._id);
		req.body._id = postId;
		req.body.rewards = [...ids];
	}
	if (poll && poll.options && Array.isArray(poll.options)) {
		const pollId = mongoose.Types.ObjectId();
		const user = req.userId;
		const updated = poll.options.map(o => ({...o, poll: pollId, user}));
		const created = await PollOption.create([...updated]);
		poll.poll_options = created.map(o => o._id);
		const validate = AppProcessor.validate(Poll, VALIDATE_CREATE, poll,
			lang.get('error').inputs);
		if (validate) {
			return next(validate);
		}
		poll._id = pollId;
		const newPoll = await new Poll(poll).save();
		req.body.poll = newPoll._id;
	}
	return next();
};
