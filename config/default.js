require('dotenv').config();
const PORT = process.env.PORT || 3000;
module.exports = {
	app: {
		name: 'Coderealm',
		port: PORT,
		baseUrl: `http://localhost:${PORT}`,
		clientBaseUrl: process.env.BASE_URL,
		appUrl: `http://coderealm-api.herokuapp.com/auth/login`,
		uploadUrl: `upload`,
		reset_password_redirect: process.env.PASSWORD_RESET_REDIRECT,
		post_types: ['Link', 'Image', 'Video', 'Text', 'Poll'],
	},
	api: {
		prefix: '^/api/v[1-9]',
		/* eslint-disable no-useless-escape */
		resourceRegex: '^/resources/[a-zA-Z-]+',
		/* eslint-enable no-useless-escape */
		versions: [1],
		patch_version: '1.0.0',
	},
	lang: 'en',
	authToken: {
		superSecret: 'ipa-BUhBOJAm',
		expiresIn: 86400,
	},
	db: {
		url: process.env.DB_URL,
	},
	facebook: {
		GraphUrl: 'https://graph.facebook.com/v2.11/me?fields=id,name,email',
		clientId: process.env.FACEBOOK_CLIENT_ID,
	},
	google: {
		url: 'https://www.googleapis.com/oauth2/v3/tokeninfo',
		clientId: process.env.GOOGLE_CLIENT_ID,
		secret: process.env.GOOGLE_SECRET,
		redirect_uris: process.env.GOOGLE_REDIRECT_URI,
		refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
	},
	geoCoder: {
		provider: 'google',
		// Optional depending on the providers
		httpAdapter: 'https', // Default
		apiKey: process.env.GOOGLE_API_KEY, // for Mapquest, OpenCage, Google Premier
		formatter: null
	},
	email: {
		sendgridApiKey: process.env.SENDGRID_API_KEY,
		from: 'no-reply@yaply.com',
		subject: 'Yaply',
		contactFormRecipient: process.env.CONTACT_FORM_EMAIL_RECIPIENT,
	},
	aws: {
		credentials: {
			accessKeyId: process.env.AWS_ACCESS_KEY,
			secretAccessKey: process.env.AWS_SECRET_KEY,
			region: process.env.AWS_REGION,
			params: {Bucket: 'voomway'},
		},
		bucket: process.env.AWS_BUCKET,
		s3Link: `https://s3-${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_BUCKET}`,
	},
	emailAlerts: {
		templateIds: {
			emailVerification: process.env.VERIFY_CODE,
			passwordRecovery: process.env.RESET_PASSWORD,
			inviteUser: process.env.USER_INVITE,
			bookedTrip: process.env.BOOKED_TRIP,
		},
	},
	itemsPerPage: {
		default: 10,
	},
};
