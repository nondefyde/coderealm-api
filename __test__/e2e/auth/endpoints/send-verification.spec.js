import User from '../../../../src/api/user/user.model';
// Require the dev-dependencies
import chai from 'chai';
import supertest from 'supertest';
import app from '../../../../src/app';
import {after, before, describe} from 'mocha';
import {SEND_VERIFICATION_URL, VERIFY_LINK_URL} from '../routes';
import {getUserObject} from '../../../_seeds/user.seed';
import {BAD_REQUEST, OK, UNAUTHORIZED} from '../../../../src/utils/status-codes';
import {signToken} from '../../../../src/utils/helper';
import {TEST_API_KEY} from '../../../_config/routes';

let should = chai.should();
let server;
let user;
let token;
// Our parent block
describe('Setup For Send Verification Test', () => {
	before(async () => {
		server = supertest(await app);
		await User.remove({});
		user = await (new User({...getUserObject(), verification_code: '1234', account_verified: false}).save());
		token = signToken({userId: user._id});
	});

	after(async () => {
		await User.remove({});
	});

	describe('Send Verification Endpoint Test ' + SEND_VERIFICATION_URL, () => {

		it('Should test send verification with invalid payload', async () => {
			const response = await server.post(VERIFY_LINK_URL)
				.send({})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.set('x-access-token', token)
				.expect(BAD_REQUEST);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body._meta.should.have.property('status_code');
			response.body._meta.should.have.property('error');
			response.body._meta.error.should.be.instanceOf(Object);
		});

		it('Should test send verification  of an invalid user and token', async () => {
			const response = await server.post(SEND_VERIFICATION_URL)
				.send({verify_redirect_url: 'http://localhost:4200/auth/verify-link'})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.set('x-access-token', token + '0')
				.expect(UNAUTHORIZED);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body._meta.should.have.property('status_code');
			response.body._meta.should.have.property('error');
			response.body._meta.error.should.be.instanceOf(Object);
		});

		it('Should test verification of a user with invalid verification hash gotten from verification link', async () => {
			const response = await server.post(SEND_VERIFICATION_URL)
				.send({verify_redirect_url: 'http://localhost:4200/auth/verify-link'})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.set('x-access-token', token)
				.expect(OK);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body.should.have.property('data');
		});
	});
});
