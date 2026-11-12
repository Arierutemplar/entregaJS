import { Router } from 'express';
import { getUsers } from '../controllers/users.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticate, authorizeRoles('admin'), getUsers);

export default router;
