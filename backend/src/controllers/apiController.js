import * as service from "../services/bookingService.js";

export async function routes(_req, res, next) {
  try {
    res.json({ routes: await service.listRoutes() });
  } catch (error) {
    next(error);
  }
}

export async function trips(req, res, next) {
  try {
    res.json({ trips: await service.listTrips(req.query) });
  } catch (error) {
    next(error);
  }
}

export async function seats(req, res, next) {
  try {
    res.json({
      trip: await service.getTripSeats(req.params.tripId, req.query.travelDate),
    });
  } catch (error) {
    next(error);
  }
}

export async function createBooking(req, res, next) {
  try {
    res.status(201).json({ ticket: await service.createBooking(req.body) });
  } catch (error) {
    next(error);
  }
}

export async function getBooking(req, res, next) {
  try {
    res.json({ ticket: await service.getBooking(req.params.pnr) });
  } catch (error) {
    next(error);
  }
}

export async function cancelBooking(req, res, next) {
  try {
    res.json({ ticket: await service.cancelBooking(req.params.pnr) });
  } catch (error) {
    next(error);
  }
}
