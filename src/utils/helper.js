import jwt from 'jsonwebtoken';
import config from 'config';
import Q from 'q';
import Aws from 'aws-sdk';
import moment from 'moment';

/**
 * @param {Object} obj The object to sign
 * @return {Object} The signed object
 */
export const signToken = (obj) => {
	return jwt.sign(obj, config.get('authToken.superSecret'), {expiresIn: config.get('authToken.expiresIn')}); // expires in 24 hours
};

/**
 * @param {Number} size Code length
 * @param {Boolean} alpha Check if it's alpha numeral
 * @return {String} The code
 */
export const generateOTCode = (size = 6, alpha = false) => {
	let characters = alpha ? '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' : '0123456789';
	characters = characters.split('');
	let selections = '';
	for (let i = 0; i < size; i++) {
		let index = Math.floor(Math.random() * characters.length);
		selections += characters[index];
		characters.splice(index, 1);
	}
	return selections;
};

/**
 * @param {Number} size Hour count
 * @return {Date} The date
 */
export const addHourToDate = (size) => {
	const date = new Date();
	let hours = date.getHours() + 1;
	date.setHours(hours);
	return date;
};

/**
 * uploadToS3
 * @param {object} params
 * @return {Promise}
 */
export const uploadToS3 = (params) => {
	const s3 = new Aws.S3(config.get('aws.credentials'));
	const s3ImageLink = config.get('aws.s3Link');
	return new Q.Promise((resolve, reject) => {
		s3.putObject(params, (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
};

/**
 * Convert date from client to UTC
 * @param {string }dateString
 * @return {string} moment date
 */
export const convertDateToUtc = (dateString) => {
	return moment.utc(dateString).format();
};

/**
 *
 * @param {Number} start
 * @param {Number} end
 * @return {Array}
 */
export function range(start, end) {
	const array = [];
	for (let i = start; i <= end; i++) {
		array.push(i);
	}
	return array;
}

/**
 *
 * @param {Moment} moment
 * @return {String}
 */
export function momentToCron(moment) {
	const day = moment.day();
	const month = moment.month() + 1;
	const date = moment.date();
	const hour = moment.hour();
	const min = moment.minute();
	return `${min} ${hour} ${date} ${month} ${day}`;
}


/**
 * Convert callback to promise;
 *  @param {Function} execute
 *  @param {Object} params
 * @return {Promise} params date
 */
export const callbackToPromise = (execute, params) => {
	return new Promise((resolve, reject) => {
		execute({...params}, (error, res) => {
			if (error) {
				if (error.response && error.response.status === 404) {
					resolve(null);
				} else {
					reject(error);
				}
			} else {
				resolve(res.data);
			}
		});
	});
};
