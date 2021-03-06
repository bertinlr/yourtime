import { Router } from 'express';
import * as EventController from '../controllers/services.controller';
import { requireAdmin } from '../util/requireAdmin';
import jwtCheck from '../util/jwtCheck';

const router = new Router();

router.route('/services')
    .get(EventController.getServices)
    .post(jwtCheck, requireAdmin, EventController.postServices);

router.route('/services/:id')
    .get(EventController.getServiceById)
    .put(jwtCheck, requireAdmin, EventController.putServiceById)
    .delete(jwtCheck, requireAdmin, EventController.deleteServiceById);


export default router;