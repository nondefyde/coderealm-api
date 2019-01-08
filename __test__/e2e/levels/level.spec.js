// Require the dev-dependencies
import mongoose from 'mongoose';
import supertest from 'supertest';
import Q from 'q';
import chai from 'chai';
import app from '../../../src/app';
import {BAD_REQUEST, CONFLICT, NOT_FOUND, OK} from '../../../src/utils/status-codes';
import {getUserObject} from '../../_seeds/user.seed';
import {getLevelObject, getLevelWithInvalidSubscription, getLevelWithInvalidTitle} from '../../_seeds/level.seed';
import {TEST_API_KEY} from '../../_config/routes';
import {signToken} from '../../../src/utils/helper';
import {LEVEL_URL} from './routes';
import {after, before, describe} from 'mocha';

const Level = mongoose.model('Level');
const User = mongoose.model('User');
const should = chai.should();
const ObjectId = mongoose.Types.ObjectId;
let user = null;
let level = null;
let token = null;

let server;
describe('Suite: Level Integration Test', () => {

	before(async () => {
		await Q.all([User.remove({}), Level.remove({})]);
		server = supertest(await app);
		user = await (new User({...getUserObject(), verification_code: '1234', account_verified: false}).save());
		token = signToken({userId: user._id});
	});
	/**
	 * @function Function to run after test ends
	 * @param {function} done
	 */
	after(async () => {
		await Q.all([User.remove({}), Level.remove({})]);
	});

	describe(`/POST ${LEVEL_URL}`, () => {
		it('Should error without inputs', async () => {
			let response = await server.post(LEVEL_URL)
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(BAD_REQUEST);
			response.body.should.be.an('object');
			response.body.should.have.property('_meta').which.is.an('object').and.not.empty;
			response.body._meta.should.have.property('error').which.is.an.instanceOf(Object);
			response.body._meta.error.should.have.property('message').which.is.a('string');
			response.body._meta.error.should.have.property('messages').which.is.an.instanceOf(Object);
		});
		it('Should error out for incomplete inputs', async () => {
			let response = await server.post(LEVEL_URL)
				.send({})
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(BAD_REQUEST);
			response.body.should.be.an('object');
			response.body.should.have.property('_meta').which.is.an('object').and.not.empty;
			response.body._meta.should.have.property('error').which.is.an.instanceOf(Object);
			response.body._meta.error.should.have.property('message').which.is.a('string');
			response.body._meta.error.should.have.property('messages').which.is.an.instanceOf(Object);
		});
		it('Should error out for inputs with invalid title', async () => {
			let response = await server.post(LEVEL_URL)
				.send(getLevelWithInvalidTitle())
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(BAD_REQUEST);
			response.body.should.be.an('object');
			response.body.should.have.property('_meta').which.is.an('object').and.not.empty;
			response.body._meta.should.have.property('error').which.is.an.instanceOf(Object);
			response.body._meta.error.should.have.property('message').which.is.a('string');
			response.body._meta.error.should.have.property('messages').which.is.an.instanceOf(Object);
		});
		it('Should error out for inputs with invalid subscription', async () => {
			let response = await server.post(LEVEL_URL)
				.send(getLevelWithInvalidSubscription())
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(BAD_REQUEST);
			response.body.should.be.an('object');
			response.body.should.have.property('_meta').which.is.an('object').and.not.empty;
			response.body._meta.should.have.property('error').which.is.an.instanceOf(Object);
			response.body._meta.error.should.have.property('message').which.is.a('string');
			response.body._meta.error.should.have.property('messages').which.is.an.instanceOf(Object);
		});
		it('Should create level with minimum inputs', async () => {
			let response = await server.post(LEVEL_URL)
				.send(getLevelObject())
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.an('object');
			response.body.should.have.property('_meta').which.is.an('object').and.not.empty;
			response.body._meta.should.have.property('success').which.is.true;
			response.body.should.have.property('data').which.is.instanceOf(Object).and.not.empty;
			response.body.data.should.have.property('_id').which.is.a('string');
			ObjectId(response.body.data._id).should.be.an.instanceOf(ObjectId);
			level = response.body.data;
		});

		it('Should error out if level with title already exist', async () => {
			let response = await server.post(LEVEL_URL)
				.send({...getLevelObject(), title: level.title})
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(CONFLICT);
			response.body.should.be.an('object');
			response.body.should.have.property('_meta').which.is.an('object').and.not.empty;
			response.body._meta.should.have.property('error').which.is.an.instanceOf(Object);
			response.body._meta.error.should.have.property('message').which.is.a('string');
			response.body._meta.error.should.have.property('messages').which.is.an.instanceOf(Object);
		});
	});
	describe(`/GET ${LEVEL_URL}/:id`, () => {
		it(`Should error out when level doesn't exist`, async () => {
			const wrongObjectId = new ObjectId();
			let response = await server.get(`${LEVEL_URL}/${wrongObjectId}`)
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(NOT_FOUND);
			response.body.should.be.an('object');
			response.body.should.have.property('_meta').which.is.an('object').and.not.empty;
			response.body._meta.should.have.property('error').which.is.an.instanceOf(Object);
			response.body._meta.error.should.have.property('message').which.is.a('string');
			response.body._meta.error.should.not.have.property('messages');
		});
		it(`Should return a single level if exist`, async () => {
			let response = await server.get(`${LEVEL_URL}/${level._id}`)
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.an('object');
			response.body.should.have.property('_meta').which.is.an('object').and.not.empty;
			response.body._meta.should.have.property('success').which.is.true;
			response.body.should.have.property('data').which.is.an('object');
		});
	});
	describe(`/PUT ${LEVEL_URL}/:id`, () => {
		it(`Should error out when level doesn't exist`, async () => {
			const wrongObjectId = new ObjectId();
			let response = await server.get(`${LEVEL_URL}/${wrongObjectId}`)
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(NOT_FOUND);
			response.body.should.be.an('object');
			response.body.should.have.property('_meta').which.is.an('object').and.not.empty;
			response.body._meta.should.have.property('error').which.is.an.instanceOf(Object);
			response.body._meta.error.should.have.property('message').which.is.a('string');
			response.body._meta.error.should.not.have.property('messages');
		});
		it(`Should update with valid inputs`, async () => {
			let response = await server.put(`${LEVEL_URL}/${level._id}`)
				.send({name: 'new update value'})
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.an('object');
			response.body.should.have.property('_meta').which.is.an('object').and.not.empty;
			response.body.should.have.property('data').which.is.an('object').and.not.empty;
			response.body._meta.should.have.property('success').which.is.true;
			response.body.data.should.have.property('_id').which.is.equal(level._id);
		});
	});
	describe(`/DEL ${LEVEL_URL}/:id`, () => {
		it(`Should error out when level doesn't exist`, async () => {
			const wrongObjectId = new ObjectId();
			let response = await server.del(`${LEVEL_URL}/${wrongObjectId}`)
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(NOT_FOUND);
			response.body.should.be.an('object');
			response.body.should.have.property('_meta').which.is.an('object').and.not.empty;
			response.body._meta.should.have.property('error').which.is.an.instanceOf(Object);
			response.body._meta.error.should.have.property('message').which.is.a('string');
			response.body._meta.error.should.not.have.property('messages');
		});
		it(`Should delete a single level if exist`, async () => {
			let response = await server.del(`${LEVEL_URL}/${level._id}`)
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.an('object');
			response.body.should.have.property('_meta').which.is.an('object').and.not.empty;
			response.body._meta.should.have.property('success').which.is.true;
			response.body.should.have.property('data');
		});
	});
});
