import React, { useState } from 'react';
import {
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

const cities = [
  'Delhi',
  'Mumbai',
  'Bengaluru',
  'Chennai',
  'Kolkata',
  'Hyderabad',
  'Ahmedabad',
  'Pune',
  'Jaipur',
  'Surat',
  'Lucknow',
  'Kanpur',
  'Nagpur',
  'Indore',
  'Bhopal',
];

const trips = [
  {
    id: 'pink-city',
    from: 'Delhi',
    to: 'Jaipur',
    departure: '22:15',
    arrival: '04:10',
    duration: '5h 55m',
    operator: 'Pink City Express',
    type: 'AC Sleeper',
    price: 899,
    seatsLeft: 8,
    color: 'peach',
  },
  {
    id: 'coastal',
    from: 'Mumbai',
    to: 'Pune',
    departure: '09:30',
    arrival: '13:15',
    duration: '3h 45m',
    operator: 'Coastal Comfort',
    type: 'AC Seater',
    price: 499,
    seatsLeft: 12,
    color: 'blue',
  },
  {
    id: 'southern',
    from: 'Bengaluru',
    to: 'Chennai',
    departure: '21:00',
    arrival: '05:30',
    duration: '8h 30m',
    operator: 'Southern Star',
    type: 'AC Sleeper',
    price: 1099,
    seatsLeft: 5,
    color: 'green',
  },
  {
    id: 'taj',
    from: 'Delhi',
    to: 'Bhopal',
    departure: '07:00',
    arrival: '10:30',
    duration: '3h 30m',
    operator: 'Taj Roadlines',
    type: 'Volvo AC',
    price: 599,
    seatsLeft: 16,
    color: 'lavender',
  },
  {
    id: 'deccan',
    from: 'Hyderabad',
    to: 'Bengaluru',
    departure: '08:15',
    arrival: '17:00',
    duration: '8h 45m',
    operator: 'Deccan Travels',
    type: 'AC Sleeper',
    price: 999,
    seatsLeft: 7,
    color: 'blue',
  },
  {
    id: 'western',
    from: 'Ahmedabad',
    to: 'Surat',
    departure: '13:20',
    arrival: '17:10',
    duration: '3h 50m',
    operator: 'Western Wheels',
    type: 'AC Seater',
    price: 449,
    seatsLeft: 19,
    color: 'green',
  },
  {
    id: 'royal',
    from: 'Jaipur',
    to: 'Delhi',
    departure: '06:40',
    arrival: '12:30',
    duration: '5h 50m',
    operator: 'Royal Rajasthan',
    type: 'Volvo AC',
    price: 799,
    seatsLeft: 9,
    color: 'peach',
  },
  {
    id: 'eastern',
    from: 'Kolkata',
    to: 'Lucknow',
    departure: '14:00',
    arrival: '23:00',
    duration: '9h',
    operator: 'Eastern Highway',
    type: 'AC Sleeper',
    price: 1199,
    seatsLeft: 6,
    color: 'lavender',
  },
  {
    id: 'central',
    from: 'Indore',
    to: 'Bhopal',
    departure: '10:30',
    arrival: '14:15',
    duration: '3h 45m',
    operator: 'Central Connect',
    type: 'AC Seater',
    price: 399,
    seatsLeft: 15,
    color: 'green',
  },
  {
    id: 'orange',
    from: 'Nagpur',
    to: 'Pune',
    departure: '18:10',
    arrival: '07:00',
    duration: '12h 50m',
    operator: 'Orange City Lines',
    type: 'AC Sleeper',
    price: 1299,
    seatsLeft: 4,
    color: 'peach',
  },
  {
    id: 'gomti',
    from: 'Lucknow',
    to: 'Kanpur',
    departure: '16:20',
    arrival: '19:00',
    duration: '2h 40m',
    operator: 'Gomti Express',
    type: 'AC Seater',
    price: 349,
    seatsLeft: 21,
    color: 'blue',
  },
  {
    id: 'diamond',
    from: 'Surat',
    to: 'Mumbai',
    departure: '11:45',
    arrival: '17:15',
    duration: '5h 30m',
    operator: 'Diamond Travels',
    type: 'AC Sleeper',
    price: 699,
    seatsLeft: 10,
    color: 'lavender',
  },
  {
    id: 'mahanagar',
    from: 'Kanpur',
    to: 'Delhi',
    departure: '19:30',
    arrival: '02:15',
    duration: '6h 45m',
    operator: 'Mahanagar Bus',
    type: 'Volvo AC',
    price: 749,
    seatsLeft: 11,
    color: 'green',
  },
  {
    id: 'narmada',
    from: 'Bhopal',
    to: 'Nagpur',
    departure: '12:30',
    arrival: '19:00',
    duration: '6h 30m',
    operator: 'Narmada Roadways',
    type: 'AC Seater',
    price: 649,
    seatsLeft: 13,
    color: 'blue',
  },
  {
    id: 'metroline',
    from: 'Chennai',
    to: 'Hyderabad',
    departure: '20:30',
    arrival: '06:00',
    duration: '9h 30m',
    operator: 'Metroline Travels',
    type: 'AC Sleeper',
    price: 1149,
    seatsLeft: 6,
    color: 'peach',
  },
];

const navItems = [
  { path: '/trips', label: 'Find a bus' },
  { path: '/seats', label: 'Seat selection' },
];

function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Wayfare home">
      <span className="brand-mark">
        <BusIcon />
      </span>
      <span>
        wayfare<span className="brand-period">.</span>
      </span>
    </Link>
  );
}

function BusIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M8 5h16a3 3 0 0 1 3 3v14H5V8a3 3 0 0 1 3-3Z" />
      <path d="M8 8h16v8H8zM8 22v3m16-3v3M8 19h2m12 0h2" />
      <circle cx="10" cy="24" r="2" />
      <circle cx="22" cy="24" r="2" />
    </svg>
  );
}

function TripCard({ trip, index, date = '' }) {
  const seatUrl = `/seats?bus=${trip.id}${date ? `&date=${date}` : ''}${trip.passengers ? `&passengers=${trip.passengers}` : ''}`;
  return (
    <article
      className="trip-card"
      style={{ '--card-delay': `${index * 70}ms` }}
    >
      <div className={`operator-mark ${trip.color}`}>
        <BusIcon />
      </div>
      <div className="trip-main">
        <div className="trip-operator">
          {trip.operator}
          <span className="verified">✓ Verified</span>
          <span className="trip-rating">★ 4.8</span>
        </div>
        <div className="trip-type">
          {trip.type}
          <span className="dot-separator">·</span>Sample bus
        </div>
        <div className="trip-route">
          <div className="time-stop">
            <strong>{trip.departure}</strong>
            <span>{trip.from}</span>
          </div>
          <div className="trip-duration">
            <span>{trip.duration}</span>
            <i />
            <small>Direct</small>
          </div>
          <div className="time-stop arrival">
            <strong>{trip.arrival}</strong>
            <span>{trip.to}</span>
          </div>
        </div>
        <div className="trip-amenities">
          <span>❄ AC</span>
          <span>ϟ Charging</span>
          <span>◌ Live tracking</span>
        </div>
      </div>
      <div className="trip-price">
        <span className="seat-count">{trip.seatsLeft} seats left</span>
        <strong>₹{trip.price.toLocaleString('en-IN')}</strong>
        <span>per seat</span>
        <Link
          className="trip-cta"
          to={seatUrl}
          aria-label={`Select seats for ${trip.operator} from ${trip.from} to ${trip.to}`}
        >
          Select seats <span>→</span>
        </Link>
      </div>
    </article>
  );
}

function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-rule" /> A BETTER WAY TO GET THERE
          </p>
          <h1>
            Good trips.
            <br />
            <span>Great stories.</span>
          </h1>
          <p className="intro">
            Find your next ride with handpicked bus routes, comfortable seats
            and a little more joy along the way.
          </p>
          <Link className="button" to="/trips">
            Explore bus trips <span>→</span>
          </Link>
          <div className="trust-row">
            <div className="avatar-stack">
              <i>R</i>
              <i>A</i>
              <i>M</i>
              <i>+</i>
            </div>
            <span>
              <strong>Made for the journey</strong>
              <small>Easy trips across India</small>
            </span>
          </div>
        </div>
        <div className="hero-art">
          <div className="sun-disc" />
          <div className="hill hill-back" />
          <div className="hill hill-front" />
          <div className="road-ribbon" />
          <div className="hero-bus">
            <div className="bus-top">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="bus-window">
              <i />
              <i />
              <i />
            </div>
            <div className="bus-front">
              <span />
            </div>
            <div className="bus-wheel wheel-one" />
            <div className="bus-wheel wheel-two" />
          </div>
          <div className="art-caption">
            <span>01 / 04</span>
            <b>Take the scenic route.</b>
            <i>↗</i>
          </div>
          <div className="art-sparkle sparkle-one">✳</div>
          <div className="art-sparkle sparkle-two">✳</div>
        </div>
      </section>
      <section className="popular-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-rule" /> THE GOOD ROUTES
            </p>
            <h2>Where to next?</h2>
          </div>
          <Link to="/trips" className="view-all">
            See all trips <span>→</span>
          </Link>
        </div>
        <div className="route-pills">
          {trips.slice(0, 3).map((trip) => (
            <Link
              to="/trips"
              className="route-pill"
              key={`${trip.from}-${trip.to}`}
            >
              <span className="route-pill-icon">↗</span>
              <span>
                <b>
                  {trip.from} <i>to</i> {trip.to}
                </b>
                <small>
                  From ₹{trip.price.toLocaleString('en-IN')} · {trip.duration}
                </small>
              </span>
              <span className="pill-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function Trips() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [time, setTime] = useState('all');
  const [sort, setSort] = useState('recommended');
  const [busType, setBusType] = useState('all');
  const filtered = trips
    .filter((trip) => {
      const hour = Number(trip.departure.slice(0, 2));
      const matchesTime =
        time === 'all' ||
        (time === 'morning' && hour >= 6 && hour < 12) ||
        (time === 'afternoon' && hour >= 12 && hour < 18) ||
        (time === 'evening' && hour >= 18) ||
        (time === 'night' && hour < 6);
      return (
        (!from || trip.from === from) &&
        (!to || trip.to === to) &&
        matchesTime &&
        trip.seatsLeft >= passengers &&
        (busType === 'all' || trip.type.toLowerCase().includes(busType))
      );
    })
    .sort((a, b) =>
      sort === 'price-low'
        ? a.price - b.price
        : sort === 'price-high'
          ? b.price - a.price
          : sort === 'departure'
            ? a.departure.localeCompare(b.departure)
            : 0,
    );
  const swapCities = () => {
    setFrom(to);
    setTo(from);
  };
  return (
    <section className="trips-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-rule" /> YOUR NEXT RIDE
          </p>
          <h1 className="page-title">
            Find your <span>way.</span>
          </h1>
          <p className="intro">A few good ways to get where you're going.</p>
        </div>
        <div className="demo-badge">
          <span /> SAMPLE TRIPS
        </div>
      </div>
      <div className="search-summary">
        <label className="search-place">
          <small>FROM</small>
          <select
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          >
            <option value="">Anywhere</option>
            {cities.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
        </label>
        <button
          className="swap-icon"
          type="button"
          onClick={swapCities}
          aria-label="Swap cities"
        >
          ↔
        </button>
        <label className="search-place">
          <small>TO</small>
          <select value={to} onChange={(event) => setTo(event.target.value)}>
            <option value="">Everywhere</option>
            {cities.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
        </label>
        <label className="search-date">
          <small>TRAVEL DATE</small>
          <input
            aria-label="Travel date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            min={new Date().toISOString().slice(0, 10)}
          />
        </label>
        <label className="search-passengers">
          <small>TRAVELLERS</small>
          <select
            aria-label="Number of travellers"
            value={passengers}
            onChange={(event) => setPassengers(Number(event.target.value))}
          >
            {[1, 2, 3, 4, 5, 6].map((count) => (
              <option key={count} value={count}>
                {count} {count === 1 ? 'traveller' : 'travellers'}
              </option>
            ))}
          </select>
        </label>
        <button
          className="search-button"
          type="button"
          onClick={() =>
            document
              .querySelector('.trip-list')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
          aria-label="Show buses"
        >
          ⌕
        </button>
      </div>
      <div className="results-heading">
        <span>
          <strong>{filtered.length} buses</strong> to get you moving
          {date
            ? ` · ${new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
            : ''}
        </span>
        <label className="sort-label">
          Sort by{' '}
          <select
            className="sort-select"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="recommended">Recommended</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="departure">Departure time</option>
          </select>
        </label>
      </div>
      <div className="filters-row">
        <span className="filter-title">Filter by</span>
        <label className="filter-control">
          Departure time
          <select
            value={time}
            onChange={(event) => setTime(event.target.value)}
          >
            <option value="all">Any time</option>
            <option value="morning">Morning · 6 am – 12 pm</option>
            <option value="afternoon">Afternoon · 12 pm – 6 pm</option>
            <option value="evening">Evening · 6 pm – 12 am</option>
            <option value="night">Night · 12 am – 6 am</option>
          </select>
        </label>
        <label className="filter-control">
          Bus type
          <select
            value={busType}
            onChange={(event) => setBusType(event.target.value)}
          >
            <option value="all">All buses</option>
            <option value="sleeper">AC Sleeper</option>
            <option value="seater">AC Seater</option>
            <option value="volvo">Volvo AC</option>
          </select>
        </label>
        <button
          className="clear-filters"
          type="button"
          onClick={() => {
            setFrom('');
            setTo('');
            setDate('');
            setTime('all');
            setSort('recommended');
            setBusType('all');
            setPassengers(1);
          }}
        >
          Clear filters
        </button>
      </div>
      <div className="trip-list">
        {filtered.map((trip, index) => (
          <TripCard
            key={trip.id}
            trip={{ ...trip, passengers }}
            index={index}
            date={date}
          />
        ))}
        {filtered.length === 0 && (
          <div className="empty-results">
            <strong>No sample buses on this route yet.</strong>
            <span>Try another city or reduce travellers or filters.</span>
          </div>
        )}
      </div>
      <p className="sample-note">
        These sample routes are for preview only. Times, ratings and fares are
        illustrative; the selected date is for search preview.
      </p>
    </section>
  );
}

function SeatSelection() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const trip = trips.find((item) => item.id === params.get('bus')) || trips[0];
  const maxSeats = Math.min(
    6,
    Math.max(1, Number(params.get('passengers')) || 1),
  );
  const [selected, setSelected] = useState([]);
  const reserved = new Set(['A2', 'A5', 'B4', 'C1', 'C6', 'D3', 'E5', 'F2']);
  const seats = [
    'A1',
    'A2',
    'A3',
    'A4',
    'A5',
    'A6',
    'B1',
    'B2',
    'B3',
    'B4',
    'B5',
    'B6',
    'C1',
    'C2',
    'C3',
    'C4',
    'C5',
    'C6',
    'D1',
    'D2',
    'D3',
    'D4',
    'D5',
    'D6',
    'E1',
    'E2',
    'E3',
    'E4',
    'E5',
    'E6',
    'F1',
    'F2',
    'F3',
    'F4',
    'F5',
    'F6',
  ];
  const toggleSeat = (seat) =>
    setSelected((current) =>
      current.includes(seat)
        ? current.filter((item) => item !== seat)
        : current.length < maxSeats
          ? [...current, seat]
          : current,
    );
  const continueToCheckout = () => {
    const next = new URLSearchParams({
      bus: trip.id,
      seats: selected.join(','),
      passengers: String(maxSeats),
    });
    if (params.get('date')) next.set('date', params.get('date'));
    navigate(`/checkout?${next.toString()}`);
  };
  return (
    <section className="seat-page">
      <div className="seat-heading">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-rule" /> YOUR RIDE, YOUR WAY
          </p>
          <h1 className="page-title">
            Pick your <span>seat.</span>
          </h1>
          <p className="intro">
            Choose {maxSeats} {maxSeats === 1 ? 'seat' : 'seats'} for{' '}
            {maxSeats === 1 ? 'your journey' : 'your group'}.
          </p>
        </div>
        <Link className="text-link" to="/trips">
          ← Change bus
        </Link>
      </div>
      <div className="seat-trip">
        <span className={`operator-mark ${trip.color}`}>
          <BusIcon />
        </span>
        <div>
          <strong>{trip.operator}</strong>
          <span>
            {trip.from} → {trip.to} · {trip.departure} · {trip.type}
          </span>
        </div>
        <b>
          ₹{trip.price.toLocaleString('en-IN')} <small>/ seat</small>
        </b>
      </div>
      <div className="seat-layout">
        <div className="seat-map">
          <div className="seat-map-top">
            <span>FRONT OF BUS</span>
            <span className="steering">◉</span>
          </div>
          <div className="seat-grid">
            {seats.map((seat, index) => (
              <React.Fragment key={seat}>
                {index % 6 === 2 && <span className="aisle" />}
                <button
                  type="button"
                  disabled={reserved.has(seat)}
                  onClick={() => toggleSeat(seat)}
                  className={`seat ${reserved.has(seat) ? 'reserved' : selected.includes(seat) ? 'chosen' : ''}`}
                  aria-label={`Seat ${seat}${reserved.has(seat) ? ', unavailable' : selected.includes(seat) ? ', selected' : ', available'}`}
                >
                  {seat.slice(1)}
                </button>
              </React.Fragment>
            ))}
          </div>
          <div className="seat-legend">
            <span>
              <i className="legend-available" /> Available
            </span>
            <span>
              <i className="legend-chosen" /> Selected
            </span>
            <span>
              <i className="legend-reserved" /> Unavailable
            </span>
          </div>
        </div>
        <aside className="seat-summary">
          <p className="eyebrow">
            YOUR SELECTION · {maxSeats}{' '}
            {maxSeats === 1 ? 'TRAVELLER' : 'TRAVELLERS'}
          </p>
          <div className="summary-route">
            <b>{trip.from}</b>
            <span>→</span>
            <b>{trip.to}</b>
          </div>
          <p className="summary-time">
            {trip.departure} departure · {trip.duration}
          </p>
          <div className="summary-seats">
            <span>Selected seats</span>
            <strong>
              {selected.length ? selected.join(', ') : 'Choose a seat'}
            </strong>
          </div>
          <div className="summary-total">
            <span>
              {selected.length} {selected.length === 1 ? 'seat' : 'seats'}
            </span>
            <strong>
              ₹{(trip.price * selected.length).toLocaleString('en-IN')}
            </strong>
          </div>
          <button
            type="button"
            className="seat-continue"
            disabled={selected.length !== maxSeats}
            onClick={continueToCheckout}
          >
            Continue to checkout <span>→</span>
          </button>
          <small className="demo-small">
            Select {maxSeats} {maxSeats === 1 ? 'seat' : 'seats'} to continue.
            Demo only; no reservation or payment is made.
          </small>
        </aside>
      </div>
      <p className="sample-note">
        Seat availability is illustrative sample data.
      </p>
    </section>
  );
}

function Checkout() {
  const [params] = useSearchParams();
  const trip = trips.find((item) => item.id === params.get('bus')) || trips[0];
  const seats = (params.get('seats') || '').split(',').filter(Boolean);
  const passengerCount = Number(params.get('passengers')) || seats.length || 1;
  const date = params.get('date');
  const [step, setStep] = useState('details');
  const [method, setMethod] = useState('upi');
  const [passenger, setPassenger] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const total = trip.price * seats.length;
  const paymentMethods = [
    { id: 'upi', label: 'UPI', detail: 'Pay with any UPI app', icon: '✳' },
    {
      id: 'card',
      label: 'Credit / debit card',
      detail: 'Visa, Mastercard, RuPay',
      icon: '▰',
    },
    {
      id: 'netbanking',
      label: 'Net banking',
      detail: 'All major banks',
      icon: '▤',
    },
  ];
  const submitDetails = (event) => {
    event.preventDefault();
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <section className="checkout-page">
      <div className="checkout-heading">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-rule" /> ALMOST THERE
          </p>
          <h1 className="page-title">
            Checkout<span>.</span>
          </h1>
          <p className="intro">
            A few details, then choose how you’d like to pay.
          </p>
        </div>
        <Link
          className="text-link"
          to={`/seats?bus=${trip.id}${date ? `&date=${date}` : ''}`}
        >
          ← Change seats
        </Link>
      </div>
      <div className="checkout-steps">
        <span className={step === 'details' ? 'current' : 'done'}>
          <i>1</i> Passenger details
        </span>
        <b />
        <span className={step === 'payment' ? 'current' : ''}>
          <i>2</i> Payment
        </span>
      </div>
      <div className="checkout-layout">
        <section className="checkout-panel">
          {step === 'details' ? (
            <form className="passenger-form" onSubmit={submitDetails}>
              <div className="panel-title">
                <h2>Who's travelling?</h2>
                <span>
                  {passengerCount}{' '}
                  {passengerCount === 1 ? 'traveller' : 'travellers'}
                </span>
              </div>
              <label>
                Lead traveller name
                <input
                  autoComplete="name"
                  required
                  placeholder="As shown on your ID"
                  value={passenger.name}
                  onChange={(event) =>
                    setPassenger({ ...passenger, name: event.target.value })
                  }
                />
              </label>
              <div className="form-two">
                <label>
                  Contact email
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    value={passenger.email}
                    onChange={(event) =>
                      setPassenger({ ...passenger, email: event.target.value })
                    }
                  />
                </label>
                <label>
                  Mobile number
                  <input
                    type="tel"
                    autoComplete="tel"
                    required
                    minLength="8"
                    placeholder="Your contact number"
                    value={passenger.phone}
                    onChange={(event) =>
                      setPassenger({ ...passenger, phone: event.target.value })
                    }
                  />
                </label>
              </div>
              <div className="traveller-seat">
                <span className="seat-tag">
                  {seats.length} {seats.length === 1 ? 'seat' : 'seats'}
                </span>
                <span>
                  {seats.length ? seats.join(', ') : 'No seat selected'}
                </span>
              </div>
              <button className="checkout-primary" type="submit">
                Continue to payment <span>→</span>
              </button>
              <p className="form-privacy">
                Details stay in this browser preview and are not sent to a
                server.
              </p>
            </form>
          ) : (
            <div className="payment-step">
              <div className="panel-title">
                <h2>Choose payment method</h2>
                <span>Payment options</span>
              </div>
              <div className="payment-options">
                {paymentMethods.map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    className={`payment-option ${method === option.id ? 'selected' : ''}`}
                    onClick={() => setMethod(option.id)}
                  >
                    <span className="payment-icon">{option.icon}</span>
                    <span className="payment-copy">
                      <strong>{option.label}</strong>
                      <small>{option.detail}</small>
                    </span>
                    <i className="radio-dot" />
                  </button>
                ))}
              </div>
              <div className="payment-disclaimer">
                <span>i</span>
                <p>
                  Secure payment is not connected in this demo. No payment
                  details will be collected and no charge will be made.
                </p>
              </div>
              <button
                type="button"
                className="checkout-primary pay-disabled"
                disabled
              >
                Pay ₹{total.toLocaleString('en-IN')} <span>→</span>
              </button>
              <button
                type="button"
                className="back-details"
                onClick={() => setStep('details')}
              >
                ← Back to passenger details
              </button>
            </div>
          )}
        </section>
        <aside className="checkout-summary">
          <p className="eyebrow">TRIP SUMMARY</p>
          <div className="summary-route">
            <b>{trip.from}</b>
            <span>→</span>
            <b>{trip.to}</b>
          </div>
          <p className="summary-time">
            {trip.operator} · {trip.departure} · {trip.duration}
          </p>
          {date && (
            <p className="checkout-date">
              Travel date{' '}
              <strong>
                {new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </strong>
            </p>
          )}
          <div className="price-row">
            <span>
              {seats.length || 0} × seat{' '}
              {seats.length ? `(${seats.join(', ')})` : ''}
            </span>
            <strong>₹{total.toLocaleString('en-IN')}</strong>
          </div>
          <div className="price-row">
            <span>Service fee</span>
            <strong>₹0</strong>
          </div>
          <div className="checkout-total">
            <span>Total</span>
            <strong>₹{total.toLocaleString('en-IN')}</strong>
          </div>
          <small className="demo-small">
            Sample fare only. This demo does not create a reservation.
          </small>
        </aside>
      </div>
      <p className="sample-note">
        Checkout preview only · payment gateway is not configured.
      </p>
    </section>
  );
}

function InfoPage({ title, description, note, step }) {
  return (
    <section className="info-page">
      <p className="eyebrow">
        <span className="eyebrow-rule" /> YOUR JOURNEY, YOUR WAY
      </p>
      <div className="step-label">
        STEP {step} <span>OF 3</span>
      </div>
      <h1 className="page-title">{title}</h1>
      <p className="intro">{description}</p>
      <div className="info-panel">
        <span className="info-icon">✳</span>
        <div>
          <strong>{note}</strong>
          <p>
            This preview is getting ready for the next step of your journey.
          </p>
        </div>
      </div>
      <Link className="text-link" to="/trips">
        ← Back to sample trips
      </Link>
    </section>
  );
}

function App() {
  return (
    <div className="site-shell">
      <header className="topbar">
        <Brand />
        <nav>
          {navItems.map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <Link className="header-cta" to="/trips">
          Let's go <span>↗</span>
        </Link>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/seats" element={<SeatSelection />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/confirmation"
            element={
              <InfoPage
                step="03"
                title={
                  <>
                    Almost <span>there.</span>
                  </>
                }
                description="Your trip details will be right here."
                note="Reservations aren't available in this preview yet."
              />
            }
          />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <footer>
        <Brand />
        <span>Good trips make good stories.</span>
        <span className="footer-right">© WAYFARE · MADE FOR THE JOURNEY</span>
      </footer>
    </div>
  );
}

export default App;
