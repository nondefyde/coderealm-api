import Category from './category/category.model';
import Sex from './sex/sex.model';
import AgeGroup from './age-group/age-group.model';
import RewardType from './reward-type/reward-type.model';

const resources = [
	{
		resource_name: 'categories',
		model: Category,
	},
	{
		resource_name: 'sexes',
		model: Sex,
	},
	{
		resource_name: 'age-groups',
		model: AgeGroup,
	},
	{
		resource_name: 'reward-types',
		model: RewardType,
	}
];
export default resources;
