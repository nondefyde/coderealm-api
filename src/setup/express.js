import express from 'express';
import logger from 'morgan';
import path from 'path';
import favicon from 'serve-favicon';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import SetUpSeeder from '../classes/seeders/setup';

const app = express();

app.use(favicon(path.join(__dirname, '../../public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use(cors());

app.get('/seeds/setups', (req, res, next) => {
	(async () => {
		const setupSeeder = new SetUpSeeder();
		await setupSeeder.seed();
		// const transportCompanySeeder = new TransportCompanySeeder();
		// await transportCompanySeeder.seed();
		return res.send('Setup seeded! ');
	})();
});

// development error handler
// will print stacktrace
export default app;
