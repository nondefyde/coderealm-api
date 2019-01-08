import {Router} from 'express';
import UserModel from './user.model';
import authToken from '../../middlewares/auth/auth_token';
import UserController from './user.controller';
import UploadFile from '../../middlewares/upload-file';

const router = Router();
const userCtrl = new UserController(UserModel);

router.use(authToken);
router.get('/users/search/:email', userCtrl.findUserByEmail);
router.put('/users/:id/upload', new UploadFile({
	type: 'file',
	folder: 'users'
}).init(), userCtrl.upload);
router.route('/users/me')
	.get(userCtrl.currentUser)
	.post(userCtrl.updateMe);
router.route('/users')
	.get(userCtrl.find);
router.param('id', userCtrl.id);
router.route('/users/:id')
	.get(userCtrl.findOne)
	.put(userCtrl.update)
	.delete(userCtrl.softDelete);
export default router;
