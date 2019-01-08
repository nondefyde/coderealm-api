import User from '../../../../src/api/user/user.model';
// Require the dev-dependencies
import chai from 'chai';
import supertest from 'supertest';
import app from '../../../../src/app';
import {after, before, describe} from 'mocha';
import {SOCIAL_AUTH_URL} from '../routes';
import {TEST_API_KEY} from '../../../_config/routes';
import {BAD_REQUEST, FORBIDDEN, OK, UNAUTHORIZED} from '../../../../src/utils/status-codes';
import {getUserObject} from '../../../_seeds/user.seed';

let should = chai.should();
let server;
let accessToken = process.env.FB_ACCESS_TOKEN;
let fbUser = process.env.FB_TEST_USER;
let loginSocialFacebookUrl = SOCIAL_AUTH_URL + '/facebook';

// Our parent block
describe('Setup For Facebook Sign in Code Test', () => {
	before(async () => {
		server = supertest(await app);
		await User.remove({});
		await (new User(getUserObject()).save());
	});

	after(async () => {
		await User.remove({});
	});
	/*
	 * Test user login /auth/login route
	 */
	describe('Reset Password Endpoint Test ' + SOCIAL_AUTH_URL, () => {

		it('Should test facebook social login with incorrect payload', async () => {
			const response = await server.post(loginSocialFacebookUrl)
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

		it('Should test facebook social login with invalid access token', async () => {
			const response = await server.post(loginSocialFacebookUrl)
				.send({
					email: 'test@gmail.com',
					username: 'test',
					access_token: 'jhsdbfvkjsdbvjhjdbvkjscbvnkjsdc',
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

		it('Should test facebook social login with inconsistent identity', async () => {
			const response = await server.post(loginSocialFacebookUrl)
				.send({
					email: 'test@gmail.com',
					username: 'test@gmail.com',
					access_token: accessToken,
				})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(UNAUTHORIZED);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body._meta.should.have.property('status_code');
			response.body._meta.should.have.property('error');
			response.body._meta.error.should.be.instanceOf(Object);
		});

		it('Should test facebook social login with valid details', async () => {
			const response = await server.post(loginSocialFacebookUrl)
				.send({
					email: fbUser,
					username: 'fbUser',
					access_token: accessToken,
				})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body.should.have.property('data');
			response.body._meta.should.have.property('token');
		});
	});
});
