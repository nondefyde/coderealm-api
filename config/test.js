require('dotenv').config();
module.exports = {
	db: {
		url: process.env.DB_TEST_URL,
	},
};
