import { Router } from 'express';
import MediaController from './media.controller';
import MediaModel from './media.model';
import UploadFile from '../../middlewares/upload-file';
import authToken from '../../middlewares/auth/auth_token';

const router = Router();
const mediaCtrl = new MediaController(MediaModel);
router.use(authToken);
router.post('/media', new UploadFile({
	type: 'file',
	folder: 'media'
}).init(), mediaCtrl.upload);
export default router;
