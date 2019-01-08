/**
 * @return {Object}
 */
export const getLevelObject = () => {
	return {
		'title': 'Free',
		'price': 0,
		'subscription': 'monthly',
		'privileges': {
			'poll': {
				'duration': 3,
				'can_view_age_distribution': 'true',
				'can_view_gender_distribution': 'true'

			},
			'post_view': {
				'visible_post': 10,
				'can_view_age_distribution': 'true',
				'can_view_gender_distribution': 'true'

			},
			'comment': {
				'visible_comment': 20,
				'can_view_age_distribution': 'true',
				'can_view_gender_distribution': 'true'

			},
			'reward': {
				'max_reward_per_post': 5
			}
		}
	};
};


export const getLevelWithInvalidTitle = () => {
	return {
		'title': 'Nonsense',
	};
};


export const getLevelWithInvalidSubscription = () => {
	return {
		'subscription': 'jhsfbvnkjs',
	};
};
