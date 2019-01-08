import Q from 'q';
import errorHandler from '../middlewares/error-handler';

export default (app) => {
	app.use(errorHandler);
	return Q.resolve(app);
};
