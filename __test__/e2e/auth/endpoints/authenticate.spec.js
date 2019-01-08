import User from '../../../../src/api/user/user.model';
// Require the dev-dependencies
import chai from 'chai';
import supertest from 'supertest';
import app from '../../../../src/app';
import {after, before, describe} from 'mocha';
import {getUserObject} from '../../../_seeds/user.seed';
import {BAD_REQUEST, OK} from '../../../../src/utils/status-codes';
import {AUTHENTICATE} from '../routes';
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

	describe('Authentication Endpoint Test ' + AUTHENTICATE, () => {
		it('Should test for invalid or bad request payload', async () => {
			const response = await server.post(AUTHENTICATE)
				.send({})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(BAD_REQUEST);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body._meta.should.have.property('status_code');
			response.body._meta.should.have.property('error');
		});
		it('Should authenticate username that does not exist', async () => {
			const response = await server.post(AUTHENTICATE)
				.send({username: 'test'})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body.should.have.property('data');
			response.body.data.should.have.property('exist');
			response.body.data.should.have.property('authenticated');
			response.body.data.exist.should.be.false;
		});
		it('Should authenticate email that does not exist', async () => {
			const response = await server.post(AUTHENTICATE)
				.send({email: 'test@gmail.com'})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body.should.have.property('data');
			response.body.data.should.have.property('exist');
			response.body.data.should.have.property('authenticated');
			response.body.data.exist.should.be.false;
		});
		it('Should authenticate username that exist', async () => {
			const response = await server.post(AUTHENTICATE)
				.send({username: getUserObject().username})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body.should.have.property('data');
			response.body.data.should.have.property('exist');
			response.body.data.should.have.property('authenticated');
			response.body.data.exist.should.be.true;
		});
		it('Should authenticate email that exist', async () => {
			const response = await server.post(AUTHENTICATE)
				.send({email: getUserObject().email})
				.set('x-api-key', TEST_API_KEY)
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.instanceOf(Object);
			response.body.should.have.property('_meta');
			response.body.should.have.property('data');
			response.body.data.should.have.property('exist');
			response.body.data.should.have.property('authenticated');
			response.body.data.exist.should.be.true;
		});
	});
});
