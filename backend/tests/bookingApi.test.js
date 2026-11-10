import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';

describe('GET /health', () => {
  it('reports that the API process is healthy', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
    expect(response.headers['x-request-id']).toBeTruthy();
  });
});

describe('trip and booking API', () => {
  async function fixture() {
    const trip = await prisma.trip.findFirst({
      where: { sampleKey: { startsWith: 'sample-0-' } },
      include: { stops: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { travelDate: 'asc' },
    });
    if (!trip) throw new Error('Seed trips before running API tests');
    const seat = await prisma.tripSeat.findFirst({
      where: { tripId: trip.id, status: 'AVAILABLE' },
      orderBy: { seatNumber: 'asc' },
    });
    if (!seat)
      throw new Error('Seed an available seat before running API tests');
    return { trip, seat };
  }

  function bookingPayload(trip, stops, seatNumber) {
    return {
      tripId: trip.id,
      travelDate: trip.travelDate.toISOString().slice(0, 10),
      boardingStopId: stops[0].id,
      dropStopId: stops[2].id,
      seatNumbers: [seatNumber],
      passengers: [{ name: 'Asha Rao', age: 28 }],
      contactEmail: 'asha@example.test',
      contactPhone: '+919876543210',
    };
  }

  it('lists routes, trips and seat maps', async () => {
    const routes = await request(app).get('/api/routes').expect(200);
    expect(routes.body.routes.length).toBeGreaterThanOrEqual(15);

    const trips = await request(app)
      .get('/api/trips?from=Delhi&to=Jaipur')
      .expect(200);
    expect(trips.body.trips.length).toBeGreaterThan(0);
    expect(trips.body.trips[0].availableSeats).toBeGreaterThan(0);

    const { trip } = await fixture();
    const seats = await request(app)
      .get(`/api/trips/${trip.id}/seats`)
      .expect(200);
    expect(seats.body.trip.seats).toHaveLength(24);
    expect(seats.body.trip.stops).toHaveLength(3);
  });

  it('validates travel date, stops and passenger details', async () => {
    const { trip, seat } = await fixture();
    const payload = bookingPayload(trip, trip.stops, seat.seatNumber);
    await request(app)
      .post('/api/bookings')
      .send({ ...payload, travelDate: 'not-a-date' })
      .expect(400);
    await request(app)
      .post('/api/bookings')
      .send({ ...payload, boardingStopId: 'another-trip-stop' })
      .expect(400);
    await request(app)
      .post('/api/bookings')
      .send({ ...payload, passengers: [{ name: '', age: 0 }] })
      .expect(400);
  });

  it('creates a PNR ticket and cancellation releases its seats', async () => {
    const { trip, seat } = await fixture();
    const payload = bookingPayload(trip, trip.stops, seat.seatNumber);
    const created = await request(app)
      .post('/api/bookings')
      .send(payload)
      .expect(201);
    const pnr = created.body.ticket.pnr;
    expect(pnr).toMatch(/^BT[A-F0-9]{16}$/);
    expect(created.body.ticket.status).toBe('CONFIRMED');
    expect(created.body.ticket.totalFare).toBe(trip.fare);
    expect(created.body.ticket.passengers[0].seatNumber).toBe(seat.seatNumber);

    await request(app).get(`/api/bookings/${pnr}`).expect(200);
    const cancelled = await request(app)
      .post(`/api/bookings/${pnr}/cancel`)
      .expect(200);
    expect(cancelled.body.ticket.status).toBe('CANCELLED');
    const released = await prisma.tripSeat.findUnique({
      where: { id: seat.id },
    });
    expect(released.status).toBe('AVAILABLE');
  });

  it('conflicts concurrent reservations for the same seat', async () => {
    const { trip, seat } = await fixture();
    const payload = bookingPayload(trip, trip.stops, seat.seatNumber);
    const results = await Promise.all([
      request(app).post('/api/bookings').send(payload),
      request(app).post('/api/bookings').send(payload),
    ]);
    expect(results.map((result) => result.status).sort()).toEqual([201, 409]);
    const winner = results.find((result) => result.status === 201).body.ticket;
    await request(app).post(`/api/bookings/${winner.pnr}/cancel`).expect(200);
  });

  afterAll(async () => prisma.$disconnect());
});
