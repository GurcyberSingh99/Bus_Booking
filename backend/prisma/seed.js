import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const cities = [
  "Delhi",
  "Jaipur",
  "Agra",
  "Lucknow",
  "Varanasi",
  "Kolkata",
  "Bhopal",
  "Mumbai",
  "Surat",
  "Ahmedabad",
  "Pune",
  "Bengaluru",
  "Chennai",
  "Hyderabad",
  "Kochi",
];
const operators = [
  "Indigo Roadways",
  "Royal Travels",
  "Coastliner",
  "CityLink",
];
const busTypes = ["AC Sleeper", "Volvo Multi-Axle", "AC Seater"];
const seats = Array.from({ length: 24 }, (_, index) => {
  const row = Math.floor(index / 4) + 1;
  const column = ["A", "B", "C", "D"][index % 4];
  return `${row}${column}`;
});

async function seed() {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);

  for (let routeIndex = 0; routeIndex < cities.length; routeIndex += 1) {
    const fromCity = cities[routeIndex];
    const toCity = cities[(routeIndex + 1) % cities.length];
    const stopCity = cities[(routeIndex + 2) % cities.length];
    for (let day = 1; day <= 30; day += 1) {
      const travelDate = new Date(now);
      travelDate.setUTCDate(travelDate.getUTCDate() + day);
      const departureAt = new Date(travelDate);
      departureAt.setUTCHours(6 + (routeIndex % 12), 30, 0, 0);
      const arrivalAt = new Date(departureAt.getTime() + 6 * 60 * 60 * 1000);
      const sampleKey = `sample-${routeIndex}-${travelDate.toISOString().slice(0, 10)}`;
      const trip = await prisma.trip.upsert({
        where: { sampleKey },
        update: {},
        create: {
          sampleKey,
          operator: operators[routeIndex % operators.length],
          busType: busTypes[routeIndex % busTypes.length],
          fromCity,
          toCity,
          travelDate,
          departureAt,
          arrivalAt,
          fare: 650 + (routeIndex % 5) * 125,
        },
      });

      await prisma.tripStop.createMany({
        data: [fromCity, stopCity, toCity].map((name, sortOrder) => ({
          tripId: trip.id,
          name,
          sortOrder,
        })),
        skipDuplicates: true,
      });
      await prisma.tripSeat.createMany({
        data: seats.map((seatNumber) => ({ tripId: trip.id, seatNumber })),
        skipDuplicates: true,
      });
    }
  }
  console.log(
    `Seeded ${cities.length} routes across the next 30 travel dates.`,
  );
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
