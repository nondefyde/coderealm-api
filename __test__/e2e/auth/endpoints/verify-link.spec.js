import User from '../../../../src/api/user/user.model';
// Require the dev-dependencies
import crypto from 'crypto';
import chai from 'chai';
import supertest from 'supertest';
import app from '../../../../src/app';
import {after, before, describe} from 'mocha';
import {getUserObject} from '../../../_seeds/user.seed';
import {BAD_REQUEST, FORBIDDEN, OK} from '../../../../src/utils/status-codes';
import {VERIFY_LINK_URL} from '../routes';
import {TEST_API_KEY} from '../../../_config/routes';

let should = chai.should();
let server;
let user;
let verify_link_hash;
// Our parent block
describe('Setup For Verify Code Test', () => {
	before(async () => {
		server = supertest(await app);
		await User.remove({});
		user = await (new User({...getUserObject(), verification_code: '1234', account_verified: false}).save());
		verify_link_hash = crypto.createHash('md5').update(user.verification_code).digest('hex');
	});

	after(async () => {
		await User.remove({});
	});

	describe('Verify Code Endpoint Test ' + VERIFY_LINK_URL, () => {
		it('Should test verification of a user with invalid verification hash gotten from verification link', async () => {
			const response = await server.post(VERIFY_LINK_URL)
				.send({email: getUserObject().email, hash: 'hjjkbfvkjsdnvnsjdkbvkjsjdkmcvsdcvdvs'})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(FORBIDDEN);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body._meta.should.have.property('status_code');
			response.body._meta.should.have.property('error');
			response.body._meta.error.should.be.instanceOf(Object);
		});

		it('Should test verification of a user with invalid payload', async () => {
			const response = await server.post(VERIFY_LINK_URL)
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

		it('Should test verification of a user with valid verification request payload', async () => {
			const response = await server.post(VERIFY_LINK_URL)
				.send({email: getUserObject().email, hash: verify_link_hash})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body.should.have.property('data');
			response.body.data.should.have.property('account_verified');
			response.body.data.account_verified.should.be.true;
		});
	});
});
