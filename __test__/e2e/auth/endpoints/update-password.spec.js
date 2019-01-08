import User from '../../../../src/api/user/user.model';
// Require the dev-dependencies
import crypto from 'crypto';
import chai from 'chai';
import supertest from 'supertest';
import app from '../../../../src/app';
import {after, before, describe} from 'mocha';
import {getUserObject} from '../../../_seeds/user.seed';
import {BAD_REQUEST, FORBIDDEN, OK} from '../../../../src/utils/status-codes';
import {addHourToDate} from '../../../../src/utils/helper';
import {UPDATE_PASSWORD_URL} from '../routes';
import {TEST_API_KEY} from '../../../_config/routes';

let should = chai.should();
let server;
let user;
let update_password_hash;
// Our parent block
describe('Setup For Update Password Test', () => {
	before(async () => {
		server = supertest(await app);
		await User.remove({});
		user = await (new User({
			...getUserObject(),
			password_reset_code: '1234',
			reset_code_expiration: addHourToDate(1)
		}).save());
		update_password_hash = crypto.createHash('md5').update(user.password_reset_code).digest('hex');
	});

	after(async () => {
		await User.remove({});
	});

	describe('Update password  Code Endpoint Test ' + UPDATE_PASSWORD_URL, () => {

		it('Should try update password of a user with invalid payload', async () => {
			const response = await server.post(UPDATE_PASSWORD_URL)
				.send({})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(BAD_REQUEST);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body._meta.should.have.property('status_code');
			response.body._meta.should.have.property('error');
			response.body._meta.error.should.be.instanceOf(Object);
		});

		it('Should try update password of a user with invalid update hash gotten from update password link', async () => {
			const response = await server.post(UPDATE_PASSWORD_URL)
				.send({
					email: getUserObject().email,
					hash: 'hjjkbfvkjsdnvnsjdkbvkjsjdkmcvsdcvdvs',
					password: 'password',
				})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(FORBIDDEN);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body._meta.should.have.property('status_code');
			response.body._meta.should.have.property('error');
			response.body._meta.error.should.be.instanceOf(Object);
		});

		it('Should update user with valid update password request payload', async () => {
			const response = await server.post(UPDATE_PASSWORD_URL)
				.send({
					email: getUserObject().email,
					hash: update_password_hash,
					password: 'password',
				})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body.should.have.property('data');
			response.body.data.success.should.be.true;
		});
	});
});
