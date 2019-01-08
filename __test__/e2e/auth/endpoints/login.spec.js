import User from '../../../../src/api/user/user.model';
// Require the dev-dependencies
import chai from 'chai';
import supertest from 'supertest';
import app from '../../../../src/app';
import {after, before, describe} from 'mocha';
import {getUserObject} from '../../../_seeds/user.seed';
import {BAD_REQUEST, NOT_FOUND, OK, UNAUTHORIZED} from '../../../../src/utils/status-codes';
import {LOGIN_URL} from '../routes';
import {TEST_API_KEY} from '../../../_config/routes';

let should = chai.should();
let server;

// Our parent block
describe('Setup For Login Test', () => {
	before(async () => {
		server = supertest(await app);
		await User.remove({});
		await (new User(getUserObject()).save());
	});

	after(async () => {
		await User.remove({});
	});

	describe('Login Endpoint Test ' + LOGIN_URL, () => {
		it('Should test login an email account that does not exist', async () => {
			const response = await server.post(LOGIN_URL)
				.send({email: 'test@gmail.com', password: 'fakepassword'})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(NOT_FOUND);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body._meta.should.have.property('status_code');
			response.body._meta.should.have.property('error');
		});

		it('Should test login a username that does not exist', async () => {
			const response = await server.post(LOGIN_URL)
				.send({username: 'test', password: 'fakepassword'})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(NOT_FOUND);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body._meta.should.have.property('status_code');
			response.body._meta.should.have.property('error');
		});

		it('Should test login with invalid user login details', async () => {
			const response = await server.post(LOGIN_URL)
				.send({email: getUserObject().email, username: getUserObject().username, password: 'fakepassword'})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(UNAUTHORIZED);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body._meta.should.have.property('status_code');
			response.body._meta.should.have.property('error');
		});

		it('Should test login with invalid request data', async () => {
			const response = await server.post(LOGIN_URL)
				.send({})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(BAD_REQUEST);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body._meta.should.have.property('status_code');
			response.body._meta.should.have.property('error');
		});

		it('Should login an existing email', async () => {
			const response = await server.post(LOGIN_URL)
				.send({email: getUserObject().email, password: getUserObject().password})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body.should.have.property('data');
			response.body._meta.should.have.property('token');
		});

		it('Should login an existing username', async () => {
			const response = await server.post(LOGIN_URL)
				.send({username: getUserObject().username, password: getUserObject().password})
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
