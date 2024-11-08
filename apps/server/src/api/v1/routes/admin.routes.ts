import { Router } from 'express';
import adminController from '../controllers/admin.controller';
import auth from '#/common/middlewares/auth.middleware';

const router = Router();

router.use(auth.admin());

router.patch('/users/role', adminController.changeRole);

router.get('/users/roles', adminController.getRoles);

router.patch('/users/disable', adminController.disableUser);

router.patch('/users/enable', adminController.enableUser);

router.get('/users', adminController.getUsers);

router.get('/users/paginated', adminController.getPaginatedUsers);

router.get('/users/:userId', adminController.getUser);

export default router;
