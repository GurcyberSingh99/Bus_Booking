import { randomBytes } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { ApiError } from "./apiError.js";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const seatPattern = /^[1-9]\d{0,1}[A-F]$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseDate(value) {
  if (typeof value !== "string" || !datePattern.test(value)) {
    throw new ApiError(400, "travelDate must use YYYY-MM-DD format");
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (
    Number.isNaN(date.valueOf()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new ApiError(400, "travelDate is not a valid calendar date");
  }
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (date < today)
    throw new ApiError(400, "Travel date cannot be in the past");
  return date;
}

function validatePassengers(passengers, seatNumbers) {
  if (!Array.isArray(passengers) || passengers.length !== seatNumbers.length) {
    throw new ApiError(400, "Provide one passenger for each selected seat");
  }
  for (const passenger of passengers) {
    if (
      !passenger ||
      typeof passenger.name !== "string" ||
      passenger.name.trim().length < 2 ||
      passenger.name.trim().length > 80 ||
      !Number.isInteger(passenger.age) ||
      passenger.age < 1 ||
      passenger.age > 120
    ) {
      throw new ApiError(400, "Each passenger needs a valid name and age");
    }
  }
}

async function validateStops(tx, tripId, boardingStopId, dropStopId) {
  if (
    typeof boardingStopId !== "string" ||
    typeof dropStopId !== "string" ||
    !boardingStopId ||
    !dropStopId ||
    boardingStopId === dropStopId
  ) {
    throw new ApiError(400, "Choose different boarding and drop stops");
  }
  const stops = await tx.tripStop.findMany({
    where: { tripId, id: { in: [boardingStopId, dropStopId] } },
  });
  const boarding = stops.find((stop) => stop.id === boardingStopId);
  const drop = stops.find((stop) => stop.id === dropStopId);
  if (!boarding || !drop)
    throw new ApiError(400, "Stops must belong to the selected trip");
  if (boarding.sortOrder >= drop.sortOrder) {
    throw new ApiError(400, "Boarding stop must come before the drop stop");
  }
}

export async function listRoutes() {
  const trips = await prisma.trip.findMany({
    distinct: ["fromCity", "toCity"],
    select: { fromCity: true, toCity: true },
    orderBy: [{ fromCity: "asc" }, { toCity: "asc" }],
  });
  return trips;
}

export async function listTrips({ from, to, travelDate }) {
  const where = {};
  if (from) where.fromCity = { equals: from, mode: "insensitive" };
  if (to) where.toCity = { equals: to, mode: "insensitive" };
  if (travelDate) where.travelDate = parseDate(travelDate);
  const trips = await prisma.trip.findMany({
    where,
    include: {
      stops: { orderBy: { sortOrder: "asc" } },
      _count: { select: { seats: true } },
      seats: { where: { status: "AVAILABLE" }, select: { id: true } },
    },
    orderBy: { departureAt: "asc" },
    take: 100,
  });
  return trips.map(({ seats, _count, ...trip }) => ({
    ...trip,
    seatCount: _count.seats,
    availableSeats: seats.length,
  }));
}

export async function getTripSeats(tripId, travelDate) {
  if (travelDate) parseDate(travelDate);
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      stops: { orderBy: { sortOrder: "asc" } },
      seats: {
        orderBy: { seatNumber: "asc" },
        select: { seatNumber: true, status: true },
      },
    },
  });
  if (
    !trip ||
    (travelDate && trip.travelDate.toISOString().slice(0, 10) !== travelDate)
  ) {
    throw new ApiError(404, "Trip not found for this travel date");
  }
  return trip;
}

export async function createBooking(input) {
  const {
    tripId,
    travelDate: dateInput,
    boardingStopId,
    dropStopId,
    seatNumbers,
    passengers,
    contactEmail,
    contactPhone,
  } = input ?? {};
  const travelDate = parseDate(dateInput);
  if (typeof tripId !== "string" || !tripId)
    throw new ApiError(400, "tripId is required");
  if (
    !Array.isArray(seatNumbers) ||
    seatNumbers.length < 1 ||
    seatNumbers.length > 6
  ) {
    throw new ApiError(400, "Select between 1 and 6 seats");
  }
  const normalizedSeats = seatNumbers.map((seat) =>
    typeof seat === "string" ? seat.trim().toUpperCase() : "",
  );
  if (
    normalizedSeats.some((seat) => !seatPattern.test(seat)) ||
    new Set(normalizedSeats).size !== normalizedSeats.length
  ) {
    throw new ApiError(400, "Seat numbers must be valid and unique");
  }
  validatePassengers(passengers, normalizedSeats);
  if (typeof contactEmail !== "string" || !emailPattern.test(contactEmail)) {
    throw new ApiError(400, "A valid contactEmail is required");
  }
  if (
    typeof contactPhone !== "string" ||
    !/^\+?[0-9\s()-]{8,20}$/.test(contactPhone)
  ) {
    throw new ApiError(400, "A valid contactPhone is required");
  }

  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({
      where: { id: tripId },
      include: { stops: { orderBy: { sortOrder: "asc" } } },
    });
    if (!trip) throw new ApiError(404, "Trip not found");
    if (trip.travelDate.toISOString().slice(0, 10) !== dateInput) {
      throw new ApiError(400, "Travel date does not match the selected trip");
    }
    await validateStops(tx, tripId, boardingStopId, dropStopId);

    const pnr = `BT${randomBytes(8).toString("hex").toUpperCase()}`;
    const booking = await tx.booking.create({
      data: {
        pnr,
        tripId,
        travelDate,
        boardingStopId,
        dropStopId,
        contactEmail: contactEmail.trim().toLowerCase(),
        contactPhone: contactPhone.trim(),
        passengers: passengers.map((passenger, index) => ({
          name: passenger.name.trim(),
          age: passenger.age,
          seatNumber: normalizedSeats[index],
        })),
        seatNumbers: normalizedSeats,
        totalFare: trip.fare * normalizedSeats.length,
      },
    });
    const reservation = await tx.tripSeat.updateMany({
      where: {
        tripId,
        seatNumber: { in: normalizedSeats },
        status: "AVAILABLE",
      },
      data: { status: "BOOKED", bookingId: booking.id },
    });
    if (reservation.count !== normalizedSeats.length) {
      throw new ApiError(
        409,
        "One or more selected seats are no longer available",
      );
    }
    return formatTicket(booking, trip);
  });
}

export async function getBooking(pnr) {
  const booking = await prisma.booking.findUnique({
    where: { pnr: String(pnr).toUpperCase() },
    include: {
      trip: { include: { stops: { orderBy: { sortOrder: "asc" } } } },
    },
  });
  if (!booking) throw new ApiError(404, "Booking not found");
  return formatTicket(booking, booking.trip);
}

export async function cancelBooking(pnr) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { pnr: String(pnr).toUpperCase() },
      include: {
        trip: { include: { stops: { orderBy: { sortOrder: "asc" } } } },
      },
    });
    if (!booking) throw new ApiError(404, "Booking not found");
    if (booking.status === "CANCELLED")
      throw new ApiError(409, "Booking is already cancelled");
    const cancelledAt = new Date();
    const updated = await tx.booking.updateMany({
      where: { id: booking.id, status: "CONFIRMED" },
      data: { status: "CANCELLED", cancelledAt },
    });
    if (!updated.count)
      throw new ApiError(409, "Booking could not be cancelled");
    await tx.tripSeat.updateMany({
      where: { bookingId: booking.id },
      data: { status: "AVAILABLE", bookingId: null },
    });
    return formatTicket(
      { ...booking, status: "CANCELLED", cancelledAt },
      booking.trip,
    );
  });
}

function formatTicket(booking, trip) {
  const boarding = trip.stops?.find(
    (stop) => stop.id === booking.boardingStopId,
  );
  const drop = trip.stops?.find((stop) => stop.id === booking.dropStopId);
  return {
    pnr: booking.pnr,
    status: booking.status,
    travelDate: booking.travelDate.toISOString().slice(0, 10),
    trip: {
      id: trip.id,
      operator: trip.operator,
      from: trip.fromCity,
      to: trip.toCity,
      departureAt: trip.departureAt,
      arrivalAt: trip.arrivalAt,
    },
    boarding: boarding ? { id: boarding.id, name: boarding.name } : undefined,
    drop: drop ? { id: drop.id, name: drop.name } : undefined,
    seats: booking.seatNumbers,
    passengers: booking.passengers,
    contactEmail: booking.contactEmail,
    contactPhone: booking.contactPhone,
    totalFare: booking.totalFare,
    createdAt: booking.createdAt,
    cancelledAt: booking.cancelledAt,
  };
}
