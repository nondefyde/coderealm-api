import User from '../../../../src/api/user/user.model';
// Require the dev-dependencies
import chai from 'chai';
import config from 'config';
import request from 'request-promise';
import supertest from 'supertest';
import app from '../../../../src/app';
import {after, before, describe} from 'mocha';
import {SOCIAL_AUTH_URL} from '../routes';
import {TEST_API_KEY} from '../../../_config/routes';
import {BAD_REQUEST, FORBIDDEN, OK, UNAUTHORIZED} from '../../../../src/utils/status-codes';
import {getUserObject} from '../../../_seeds/user.seed';

let should = chai.should();
let server;
let validUserEmail = getUserObject().email;
let accessToken = process.env.GO_ACCESS_TOKEN;

let loginSocialGoogleUrl = SOCIAL_AUTH_URL + '/google';

// Our parent block
describe('Setup For Google Sign in Code Test', () => {
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
	describe('Google social authentication /POST api/social-auth/google', () => {
		it('Should test social login with incorrect payload', async () => {
			const response = await server.post(loginSocialGoogleUrl)
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

		it('Should test social login with invalid access token', async () => {
			const response = await server.post(loginSocialGoogleUrl)
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

		it('Should test social login with inconsistent identity', async () => {
			const gRes = await request.post({
				headers: {'content-type': 'application/x-www-form-urlencoded'},
				url: 'https://www.googleapis.com/oauth2/v4/token',
				body: `client_secret=${config.get('google.secret')}&client_id=${config.get('google.clientId')}&refresh_token=${config.get('google.refresh_token')}&grant_type=refresh_token`
			});
			const googleAuthBody = JSON.parse(gRes);
			googleAuthBody.should.be.instanceOf(Object);
			googleAuthBody.should.have.property('access_token');
			const response = await server.post(loginSocialGoogleUrl)
				.send({
					email: 'nondefyde@gmail.com',
					username: 'nondefyde',
					access_token: googleAuthBody.id_token,
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

		it('Should test google social login with valid details', async () => {
			const gRes = await request.post({
				headers: {'content-type': 'application/x-www-form-urlencoded'},
				url: 'https://www.googleapis.com/oauth2/v4/token',
				body: `client_secret=${config.get('google.secret')}&client_id=${config.get('google.clientId')}&refresh_token=${config.get('google.refresh_token')}&grant_type=refresh_token`
			});
			const googleAuthBody = JSON.parse(gRes);
			googleAuthBody.should.be.instanceOf(Object);
			googleAuthBody.should.have.property('access_token');
			const response = await server.post(loginSocialGoogleUrl)
				.send({
					email: 'ekaruztest@gmail.com',
					username: 'ekaruztest',
					access_token: googleAuthBody.id_token,
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
