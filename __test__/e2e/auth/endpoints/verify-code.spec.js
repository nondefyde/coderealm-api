import User from '../../../../src/api/user/user.model';
// Require the dev-dependencies
import chai from 'chai';
import supertest from 'supertest';
import app from '../../../../src/app';
import {after, before, describe} from 'mocha';
import {getUserObject} from '../../../_seeds/user.seed';
import {BAD_REQUEST, FORBIDDEN, OK, UNAUTHORIZED} from '../../../../src/utils/status-codes';
import {signToken} from '../../../../src/utils/helper';
import {VERIFY_URL} from '../routes';
import {TEST_API_KEY} from '../../../_config/routes';

let should = chai.should();
let server;
let user;
let token;
// Our parent block
describe('Setup For Verify Code Test', () => {
	before(async () => {
		server = supertest(await app);
		await User.remove({});
		user = await (new User({...getUserObject(), verification_code: '1234', account_verified: false}).save());
		token = signToken({userId: user._id});
	});

	after(async () => {
		await User.remove({});
	});

	describe('Verify Code Endpoint Test ' + VERIFY_URL, () => {
		it('Should test verification of a user with unauthorized token', async () => {
			const response = await server.post(VERIFY_URL)
				.send({verification_code: 145321})
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token + '90')
				.expect('Content-type', /json/)
				.expect(UNAUTHORIZED);
			console.log('response : ', response.body);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body._meta.should.have.property('status_code');
			response.body._meta.should.have.property('error');
			response.body._meta.error.should.be.instanceOf(Object);
		});
		it('Should test verification of a user with invalid verification code', async () => {
			const response = await server.post(VERIFY_URL)
				.send({verification_code: 145321})
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.expect('Content-type', /json/)
				.expect(FORBIDDEN);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body._meta.should.have.property('status_code');
			response.body._meta.should.have.property('error');
			response.body._meta.error.should.be.instanceOf(Object);
		});

		it('Should test verification of a user with invalid payload', async () => {
			const response = await server.post(VERIFY_URL)
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

		it('Should test verification of a user with valid verification request payload', async () => {
			const response = await server.post(VERIFY_URL)
				.send({verification_code: user.verification_code})
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
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
