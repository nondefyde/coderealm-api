import User from '../../api/user/user.model';
import Category from '../../api/resource/category/category.model';
import Resources from '../../api/resource';
import { CATEGORIES, SEX, USERS } from './data';

/**
 * @class JobSeeder
 */
export default class SetUpSeeder {
	/**
	 * @param {object} options object
	 */
	constructor(options = {count: 5}) {
		process.env.NODE_ENV = 'seeding';
		console.log('Begin Setup Seed');
		this.options = options;
		this.seed = this.seed.bind(this);
	}

	/**
	 * Entry setup method
	 */
	async seed() {
		await this.purge();
		await this.seedBasic();
		await this.seedUsers();
	}

	/**
	 * Entry setup method
	 */
	async purge() {
		Resources.map(async (resource) => await resource.model.remove({}).exec());
		await User.deleteMany({}).exec();
	}

	/**
	 * Entry setup method
	 */
	async seedBasic() {
		try {
			await Category.create(CATEGORIES);
		} catch (e) {
			console.log('e : ', e);
		}
	}

	/**
	 * Entry setup method
	 */
	async seedUsers() {
		try {
			for (let i = 0; i < USERS.length; i++) {
				const user = await new User(USERS[i]);
				await user.save();
			}
		} catch (e) {
			console.log('e : ', e);
		}
	}
}

