import { Router } from 'express';
import * as controller from '../controllers/apiController.js';

const router = Router();
router.get('/routes', controller.routes);
router.get('/trips', controller.trips);
router.get('/trips/:tripId/seats', controller.seats);
router.post('/bookings', controller.createBooking);
router.get('/bookings/:pnr', controller.getBooking);
router.post('/bookings/:pnr/cancel', controller.cancelBooking);

export default router;
