import { Router } from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from '../controllers/services.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { serviceIdParamsSchema } from '../validations/params.validation.js';
import {
  createServiceSchema,
  servicesQuerySchema,
  updateServiceSchema
} from '../validations/services.validation.js';

const router = Router();

router.get('/', validate(servicesQuerySchema, 'query'), getServices);
router.get('/:sid', validate(serviceIdParamsSchema, 'params'), getServiceById);
router.post('/', validate(createServiceSchema), createService);
router.put('/:sid', validate(serviceIdParamsSchema, 'params'), validate(updateServiceSchema), updateService);
router.delete('/:sid', validate(serviceIdParamsSchema, 'params'), deleteService);

export default router;
