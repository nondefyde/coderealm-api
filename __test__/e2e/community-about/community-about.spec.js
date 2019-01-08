// Require the dev-dependencies
import mongoose from 'mongoose';
import supertest from 'supertest';
import Q from 'q';
import chai from 'chai';
import app from '../../../src/app';
import { BAD_REQUEST, NOT_FOUND, OK } from '../../../src/utils/status-codes';
import { getUserObject } from '../../_seeds/user.seed';
import { getCommunityAboutObject } from '../../_seeds/community-about.seed';
import { TEST_API_KEY } from '../../_config/routes';
import { signToken } from '../../../src/utils/helper';
import { COMMUNITY_ABOUT_URL } from './routes';
import { after, before, describe } from 'mocha';

const Category = mongoose.model('Category');
const Community = mongoose.model('Community');
const CommunityAbout = mongoose.model('CommunityAbout');
const User = mongoose.model('User');
const should = chai.should();
const ObjectId = mongoose.Types.ObjectId;
let user = null;
let community = null;
let categories = null;
let token = null;

let server;
describe('Suite: Community About Integration Test', () => {

	before(async () => {
		await Q.all([
			User.remove({}),
			CommunityAbout.remove({}),
			Category.remove({}),
		]);
		server = supertest(await app);
		const created = await Category.create([
			{name: 'style'},
			{name: 'finance'}
		]);
		categories = created.map(c => c._id);
		community = await new Community({
			'handle': 'Parent',
			'introduction': 'Parent Community company',
			'categories': categories,
			'description': 'About Parent Community'
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
			CommunityAbout.remove({}),
			Category.remove({}),
		]);
	});

	describe(`/POST ${COMMUNITY_ABOUT_URL}`, () => {
		it('Should error without inputs', async () => {
			let response = await server.post(COMMUNITY_ABOUT_URL)
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
			let response = await server.post(COMMUNITY_ABOUT_URL)
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
			let response = await server.post(COMMUNITY_ABOUT_URL)
				.send(getCommunityAboutObject())
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
		it('Should create community about with minimum inputs', async () => {
			let response = await server.post(COMMUNITY_ABOUT_URL)
				.send({...getCommunityAboutObject(), community: community._id})
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
	});
	describe(`/GET ${COMMUNITY_ABOUT_URL}/:id`, () => {
		it(`Should error out when community about doesn't exist`, async () => {
			const wrongObjectId = new ObjectId();
			let response = await server.get(`${COMMUNITY_ABOUT_URL}/${wrongObjectId}`)
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
		it(`Should return a single community about if exist`, async () => {
			let response = await server.get(`${COMMUNITY_ABOUT_URL}/${community._id}`)
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
	describe(`/PUT ${COMMUNITY_ABOUT_URL}/:id`, () => {
		it(`Should error out when community about doesn't exist`, async () => {
			const wrongObjectId = new ObjectId();
			let response = await server.get(`${COMMUNITY_ABOUT_URL}/${wrongObjectId}`)
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
			let response = await server.put(`${COMMUNITY_ABOUT_URL}/${community._id}`)
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
	describe(`/DEL ${COMMUNITY_ABOUT_URL}/:id`, () => {
		it(`Should error out when community about doesn't exist`, async () => {
			const wrongObjectId = new ObjectId();
			let response = await server.del(`${COMMUNITY_ABOUT_URL}/${wrongObjectId}`)
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
		it(`Should delete a single community about if exist`, async () => {
			let response = await server.del(`${COMMUNITY_ABOUT_URL}/${community._id}`)
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
