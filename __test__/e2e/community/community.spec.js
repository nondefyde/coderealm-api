// Require the dev-dependencies
import mongoose from 'mongoose';
import supertest from 'supertest';
import Q from 'q';
import chai from 'chai';
import app from '../../../src/app';
import { BAD_REQUEST, CONFLICT, NOT_FOUND, OK } from '../../../src/utils/status-codes';
import { getUserObject } from '../../_seeds/user.seed';
import { getCommnityObject, getCommunityObject, } from '../../_seeds/community.seed';
import { TEST_API_KEY } from '../../_config/routes';
import { signToken } from '../../../src/utils/helper';
import { COMMUNITY_URL, SUB_COMMUNITY_URL } from './routes';
import { after, before, describe } from 'mocha';

const Category = mongoose.model('Category');
const Community = mongoose.model('Community');
const User = mongoose.model('User');
const should = chai.should();
const ObjectId = mongoose.Types.ObjectId;
let user = null;
let community = null;
let parentCommninty = null;
let categories = null;
let token = null;

let server;
describe('Suite: Community Integration Test', () => {

	before(async () => {
		await Q.all([
			User.remove({}),
			Community.remove({}),
			Category.remove({}),
		]);
		server = supertest(await app);
		const created = await Category.create([
			{name: 'style'},
			{name: 'finance'}
		]);
		categories = created.map(c => c._id);
		parentCommninty = await new Community({
			'handle': 'Parent',
			'introduction': 'Parent Commninty company',
			'categories': categories,
			'description': 'About Parent Commninty'
		}).save();
		user = await (new User({...getUserObject(), verification_code: '1234', account_verified: false}).save());
		token = signToken({userId: user._id});
	});
	/**
	 * @function Function to run after test ends
	 * @param {function} done
	 */
	after(async () => {
		await Q.all([
			User.remove({}),
			Community.remove({}),
			Category.remove({}),
		]);
	});

	describe(`/POST ${COMMUNITY_URL}`, () => {
		it('Should error without inputs', async () => {
			let response = await server.post(COMMUNITY_URL)
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
			let response = await server.post(COMMUNITY_URL)
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
		it('Should error out for inputs with invalid categories', async () => {
			let response = await server.post(COMMUNITY_URL)
				.send(getCommunityObject())
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(NOT_FOUND);
			response.body.should.be.an('object');
			response.body.should.have.property('_meta').which.is.an('object').and.not.empty;
			response.body._meta.should.have.property('error').which.is.an.instanceOf(Object);
			response.body._meta.error.should.have.property('message').which.is.a('string');
		});
		it('Should create community with minimum inputs', async () => {
			let response = await server.post(COMMUNITY_URL)
				.send({...getCommunityObject(), categories: [...categories], parent: parentCommninty._id})
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
			community = response.body.data;
		});

		it('Should error out if community handle already exist', async () => {
			let response = await server.post(COMMUNITY_URL)
				.send({...getCommunityObject(), categories: [...categories], handle: community.handle})
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

		it(`Should add a moderator to a community`, async () => {
			let response = await server.post(`${COMMUNITY_URL}/${community._id}/moderators`)
				.send({moderator: user._id})
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.an('object');
			response.body.should.have.property('_meta').which.is.an('object').and.not.empty;
			response.body._meta.should.have.property('success').which.is.true;
			response.body.should.have.property('data').which.is.instanceOf(Object).and.not.empty;
			response.body.data.should.have.property('moderators').which.is.instanceOf(Array).and.not.empty;
			ObjectId(response.body.data._id).should.be.an.instanceOf(ObjectId);
		});

		it(`Should remove a moderator to a community`, async () => {
			let response = await server.post(`${COMMUNITY_URL}/${community._id}/moderators`)
				.send({moderator: user._id})
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.an('object');
			response.body.should.have.property('_meta').which.is.an('object').and.not.empty;
			response.body._meta.should.have.property('success').which.is.true;
			response.body.should.have.property('data').which.is.instanceOf(Object).and.not.empty;
			response.body.data.should.have.property('moderators').which.is.instanceOf(Array).and.empty;
			ObjectId(response.body.data._id).should.be.an.instanceOf(ObjectId);
		});
	});
	describe(`/GET ${COMMUNITY_URL}/:id`, () => {
		it(`Should error out when community doesn't exist`, async () => {
			const wrongObjectId = new ObjectId();
			let response = await server.get(`${COMMUNITY_URL}/${wrongObjectId}`)
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
		it(`Should return a single community if exist`, async () => {
			let response = await server.get(`${COMMUNITY_URL}/${community._id}`)
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
	describe(`/PUT ${COMMUNITY_URL}/:id`, () => {
		it(`Should error out when community doesn't exist`, async () => {
			const wrongObjectId = new ObjectId();
			let response = await server.get(`${COMMUNITY_URL}/${wrongObjectId}`)
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
			let response = await server.put(`${COMMUNITY_URL}/${community._id}`)
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
			response.body.data.should.have.property('_id').which.is.equal(community._id);
		});
	});
	describe(`/GET ${SUB_COMMUNITY_URL}/:parentId`, () => {
		it(`Should get sub community by parent id`, async () => {
			let response = await server.get(`${SUB_COMMUNITY_URL}/${parentCommninty._id}`)
				.set('x-api-key', TEST_API_KEY)
				.set('x-access-token', token)
				.set('Accept', 'application/json')
				.expect('Content-type', /json/)
				.expect(OK);
			response.body.should.be.an('object');
			response.body.should.have.property('_meta').which.is.an('object').and.not.empty;
			response.body._meta.should.have.property('success').which.is.true;
			response.body.should.have.property('data').which.is.an('array');
		});
	});
	describe(`/DEL ${COMMUNITY_URL}/:id`, () => {
		it(`Should error out when community doesn't exist`, async () => {
			const wrongObjectId = new ObjectId();
			let response = await server.del(`${COMMUNITY_URL}/${wrongObjectId}`)
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
		it(`Should delete a single community if exist`, async () => {
			let response = await server.del(`${COMMUNITY_URL}/${community._id}`)
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
