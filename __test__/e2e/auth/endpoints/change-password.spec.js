import User from '../../../../src/api/user/user.model';
// Require the dev-dependencies
import chai from 'chai';
import supertest from 'supertest';
import app from '../../../../src/app';
import {after, before, describe} from 'mocha';
import {getUserObject} from '../../../_seeds/user.seed';
import {CHANGE_PASSWORD_URL} from '../routes';
import {signToken} from '../../../../src/utils/helper';
import {BAD_REQUEST, NOT_FOUND, OK} from '../../../../src/utils/status-codes';
import {TEST_API_KEY} from '../../../_config/routes';

let should = chai.should();
let server;
let token = '';

// Our parent block
describe('Setup For Change Password Code Test', () => {
	before(async () => {
		server = supertest(await app);
		await User.remove({});
		const user = await (new User({...getUserObject(), account_verified: true}).save());
		token = signToken({userId: user._id});
	});

	after(async () => {
		await User.remove({});
	});
	/*
	 * Test change password endpoint
	 */
	describe('Reset Password Endpoint Test ' + CHANGE_PASSWORD_URL, () => {

		it('Should test change password with incorrect payload', async () => {
			const response = await server.post(CHANGE_PASSWORD_URL)
				.send({})
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.expect('Content-type', /json/)
				.expect(BAD_REQUEST);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body._meta.should.have.property('status_code');
			response.body._meta.should.have.property('error');
			response.body._meta.error.should.be.instanceOf(Object);
		});

		it('Should test change password with incorrect previous password', async () => {
			const response = await server.post(CHANGE_PASSWORD_URL)
				.send({current_password: 'wrongpass', password: 'password',})
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.expect('Content-type', /json/)
				.expect(NOT_FOUND);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body._meta.should.have.property('status_code');
			response.body._meta.should.have.property('error');
			response.body._meta.error.should.be.instanceOf(Object);
		});

		it('Should test change password with an authorized user and valid previous password', async () => {
			const response = await server.post(CHANGE_PASSWORD_URL)
				.send({current_password: getUserObject().password, password: 'newpassword'})
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body.should.have.property('data');
		});
	});
});
