import { Router } from 'express';
import * as EventController from '../controllers/days.controller';
import { requireAdmin } from '../util/requireAdmin';
import jwtCheck from '../util/jwtCheck';

const router = new Router();

router.route('/days')
    .get(EventController.getDays)
    .post(jwtCheck, requireAdmin, EventController.postDays);

router.route('/days/:id')
    .get(EventController.getDayById)
    .put(jwtCheck, requireAdmin, EventController.putDayById)
    .delete(jwtCheck, requireAdmin, EventController.deleteDayById);

export default router;