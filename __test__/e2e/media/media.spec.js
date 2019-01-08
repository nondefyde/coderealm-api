// Require the dev-dependencies
import mongoose from 'mongoose';
import supertest from 'supertest';
import Q from 'q';
import chai from 'chai';
import app from '../../../src/app';
import {BAD_REQUEST, OK} from '../../../src/utils/status-codes';
import {getUserObject} from '../../_seeds/user.seed';
import {TEST_API_KEY} from '../../_config/routes';
import {signToken} from '../../../src/utils/helper';
import {MEDIA_URL} from '../media/routes';
import {after, before, describe} from 'mocha';
import {LEVEL_URL} from '../levels/routes';

const Media = mongoose.model('Media');
const User = mongoose.model('User');
const should = chai.should();
const ObjectId = mongoose.Types.ObjectId;
let user = null;
let media = null;
let token = null;

let server;
describe('Suite: Level Integration Test', () => {

	before(async () => {
		await Q.all([User.remove({}), Media.remove({})]);
		server = supertest(await app);
		user = await (new User({...getUserObject(), verification_code: '1234', account_verified: false}).save());
		token = signToken({userId: user._id});
	});
	/**
	 * @function Function to run after test ends
	 * @param {function} done
	 */
	after(async () => {
		await Q.all([User.remove({}), Media.remove({})]);
	});

	describe(`/POST ${MEDIA_URL}`, () => {
		it('Should error without invalid input', async () => {
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
		it('Should create a media', async () => {
			let response = await server.post(MEDIA_URL)
				.field('type', 'logo')
				.attach('file', '__test__/e2e/media/logo.jpg')
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
		});
	});
});
