import User from '../../../../src/api/user/user.model';
// Require the dev-dependencies
import chai from 'chai';
import config from 'config';
import supertest from 'supertest';
import app from '../../../../src/app';
import {after, before, describe} from 'mocha';
import {getUserObject} from '../../../_seeds/user.seed';
import {BAD_REQUEST, NOT_FOUND, OK} from '../../../../src/utils/status-codes';
import {RESET_PASSWORD_URL} from '../routes';
import {TEST_API_KEY} from '../../../_config/routes';

let should = chai.should();
let server;
const redirect_url = `${config.get('app.clientBaseUrl')}/${config.get('app.reset_password_redirect')}`;

// Our parent block
describe('Setup For Reset Password Code Test', () => {
	before(async () => {
		server = supertest(await app);
		await User.remove({});
		await (new User({...getUserObject(), verification_code: '1234', account_verified: false}).save());
	});

	after(async () => {
		await User.remove({});
	});
	/*
	 * Test reset password endpoint
	 */
	describe('Reset Password Endpoint Test ' + RESET_PASSWORD_URL, () => {

		it('Should test reset password of a user with invalid payload', async () => {
			const response = await server.post(RESET_PASSWORD_URL)
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

		it('Should test reset password with a user that does not exist', async () => {
			const response = await server.post(RESET_PASSWORD_URL)
				.send({email: 'fakeuser@gmail.com', redirect_url})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(NOT_FOUND);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body._meta.should.have.property('status_code');
			response.body._meta.should.have.property('error');
			response.body._meta.error.should.be.instanceOf(Object);
		});

		it('Should test reset password with an existing user email', async () => {
			const response = await server.post(RESET_PASSWORD_URL)
				.send({email: getUserObject().email, redirect_url})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body.should.have.property('data');
			response.body.data.should.have.property('email');
		});
	});
});
