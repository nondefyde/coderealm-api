import mongoose from 'mongoose';
import q from 'q';

export default config => {
	mongoose.Promise = q.Promise;
	mongoose.connection.on('disconnected', function () {
		console.log('Mongoose connection to mongodb shell disconnected');
	});
	// Connect to MongoDb
	return mongoose
		.connect(config.get('db.url'), {
			useCreateIndex: true,
			useNewUrlParser: true
		})
		.then(() => {
			console.log('Mongoose connected to mongo shell.');
			console.log('mongodb url ', config.get('db.url'));
		}, err => {
			console.log('Mongoose could not connect to mongo shell!');
			console.log(err);
		});
};
