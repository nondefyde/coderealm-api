import User from '../../../../src/api/user/user.model';
// Require the dev-dependencies
import chai from 'chai';
import supertest from 'supertest';
import app from '../../../../src/app';
import {after, before, describe} from 'mocha';
import {getUserObject} from '../../../_seeds/user.seed';
import {BAD_REQUEST, CONFLICT, OK} from '../../../../src/utils/status-codes';
import {REGISTER_URL} from '../routes';
import {TEST_API_KEY} from '../../../_config/routes';

let should = chai.should();
let server;

// Our parent block
describe('Setup For Register Test', () => {
	before(async () => {
		server = supertest(await app);
		await User.remove({});
		await (new User(getUserObject()).save());
		// Before each test we empty the database
	});
	/*
	 * Function to run after test is complete
	 */
	after(async () => { // Before each test we empty the database
		await User.remove({});
	});
	/*
	 * Test a new user registration /auth/register route
	 */
	describe('Register Endpoint Test' + REGISTER_URL, () => {
		it('Should test creating a user with invalid payload', async () => {
			const response = await server.post(REGISTER_URL)
				.send({email: 'test'})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(BAD_REQUEST);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body._meta.should.have.property('status_code');
			response.body._meta.should.have.property('error');
			response.body._meta.error.should.be.instanceOf(Object);
		});

		it('Should test creating a user that already exist', async () => {
			const response = await server.post(REGISTER_URL)
				.send({
					email: getUserObject().email,
					username: getUserObject().username,
					password: getUserObject().password,
					verify_redirect_url: 'http://localhost:4200/auth/verify-link'
				})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(CONFLICT);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body._meta.should.have.property('status_code');
			response.body._meta.should.have.property('error');
			response.body._meta.error.should.be.instanceOf(Object);
		});

		it('Should test creating a user with the expected details', async () => {
			const response = await server.post(REGISTER_URL)
				.send({
					email: 'validuser@gmail.com',
					username: 'validuser',
					password: getUserObject().password,
					verify_redirect_url: 'http://localhost:4200/auth/verify-link'
				})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body.should.have.property('data');
			response.body._meta.should.have.property('token');
			response.body.data.should.have.property('verification_code');
			response.body.data.verification_code.should.be.a('string');
			response.body._meta.token.should.be.a('string');
		});
	});
});
