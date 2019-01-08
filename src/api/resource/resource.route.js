import {Router} from 'express';
import config from 'config';
import authToken from '../../middlewares/auth/auth_token';
import checkResourceRegex from '../../middlewares/api/check-resource-regex';
import ResourceController from '../../api/resource/resource.controller';

const router = Router();
const resourceCtrl = new ResourceController();
const regex = config.get('api.resourceRegex');

router.use(authToken);
router.get('/resources/all', resourceCtrl.all);
router.get('/resources/list', resourceCtrl.list);
router.use(checkResourceRegex);
router.param('id', resourceCtrl.id);
router.route(regex)
	.post(resourceCtrl.create)
	.get(resourceCtrl.find);
router.route(`${regex}/:id([a-zA-Z0-9]+)`)
	.get(resourceCtrl.findOne)
	.put(resourceCtrl.update)
	.delete(resourceCtrl.delete);
export default router;
