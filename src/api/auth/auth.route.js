import {Router} from 'express';
import User from '../user/user.model';
import authToken from '../../middlewares/auth/auth_token';
import AuthController from '../../api/auth/auth.controller';

const router = Router();
const authCtrl = new AuthController(User);

router.use(authToken);
router.post('/social-auth/:social', authCtrl.socialSignIn);
router.post('/login', authCtrl.login);
router.post('/register', authCtrl.register);
router.post('/verify-link', authCtrl.verifyLink);
router.post('/send-verification', authCtrl.sendVerificationCode);
router.post('/reset-password', authCtrl.resetPassword);
router.post('/update-password', authCtrl.updatePassword);
router.post('/change-password', authCtrl.changePassword);
router.post('/authenticate', authCtrl.authenticate);

export default router;
