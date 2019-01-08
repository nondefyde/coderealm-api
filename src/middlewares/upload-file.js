import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import config from 'config';
import uuid from 'uuid';
import path from 'path';

const s3 = new aws.S3(config.get('aws.credentials'));

/**
 * @class
 */
class UploadFile {
	/**
	 * @constructor
	 * @param {object} options The options object
	 */
	constructor(options = {type: 'media', size: 1, folder: 'media'}) {
		this.type = options.type;
		this.size = options.size;
		this.folder = options.folder;
		this.getMulter = this.getMulter.bind(this);
		this.init = this.init.bind(this);
	}

	/**
	 * @function
	 * @return {function}
	 */
	getMulter() {
		return multer({
			/* eslint-disable comma-dangle*/
			storage: multerS3({
				s3: s3,
				bucket: config.get('aws.bucket'),
				metadata: (req, file, cb) => {
					console.log('passed meta');
					cb(null, {originalname: file.originalname, fieldName: file.fieldname, mimetype: file.mimetype});
				},
				key: (req, file, cb) => {
					const ext = path.extname(file.originalname);
					const fileName = `${uuid.v1()}-${Date.now().toString()}${ext}`;
					let folder = this.folder;
					if (req.body['folder']) {
						folder = req.body['folder'];
					}
					if (req.body['type']) {
						folder += `/${req.body.type}`;
					} else {
						req.body['type'] = folder;
					}
					const prefix = `${folder}/${fileName}`;
					cb(null, prefix);
				}
			}),
			fileFilter: (req, file, cb) => {
				cb(null, true);
			},
		});
		/* eslint-enable comma-dangle*/
	}

	/**
	 * @function
	 * @return {function}
	 */
	init() {
		let middleware = this.getMulter().single(this.type);
		if (this.size > 1) {
			middleware = this.getMulter().array(this.type, this.size);
		}
		return middleware;
	}
}

export default UploadFile;
