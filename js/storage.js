// Multi-Trip Persistence & Default Seed Data
const TRIPS_KEY = "wandersquad_trips_v2";
const ACTIVE_TRIP_ID_KEY = "wandersquad_active_trip_id_v2";

export const DEFAULT_TRIPS = [
  {
    id: "trip_amalfi_2027",
    title: "Amalfi Coast Roadtrip & Villa",
    destination: "Amalfi Coast, Italy",
    coverImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1600&auto=format&fit=crop&q=80",
    startDate: "2027-07-10",
    endDate: "2027-07-18",
    currency: "EUR",
    currencySymbol: "€",
    friends: [
      { id: "user_alex", name: "Alex Rivera", email: "alex.travels@example.com", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces", role: "Organizer", color: "#3b82f6" },
      { id: "user_sam", name: "Sam Chen", email: "sam.c@example.com", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces", role: "Navigator", color: "#10b981" },
      { id: "user_jordan", name: "Jordan Taylor", email: "jordan.t@example.com", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces", role: "Foodie Chief", color: "#8b5cf6" },
      { id: "user_mia", name: "Mia Rossi", email: "mia.rossi@example.com", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces", role: "Photographer", color: "#f59e0b" }
    ],
    itinerary: [
      { id: "it_1", day: 1, date: "2027-07-10", time: "10:30", title: "Arrive at Naples Airport & Pick Up Rental Van", location: "Naples Capodichino (NAP)", category: "Transport", notes: "Pick up the 9-seater Mercedes van. Contract under Alex.", completed: true },
      { id: "it_2", day: 1, date: "2027-07-10", time: "14:00", title: "Check into Cliffside Villa & Pool Dip", location: "Positano Hillside Villa", category: "Stay", notes: "Key box code #8821. Welcome Prosecco ready on terrace.", completed: false },
      { id: "it_3", day: 2, date: "2027-07-11", time: "09:00", title: "Hike Path of the Gods (Sentiero degli Dei)", location: "Bomerano to Nocelle", category: "Activity", notes: "Bring plenty of water, hiking boots and sunscreen. Approx 3.5 hours.", completed: false },
      { id: "it_4", day: 2, date: "2027-07-11", time: "19:30", title: "Sunset Dinner at Da Vincenzo", location: "Positano Centro", category: "Food", notes: "Table reserved for 4 outside. Try the lemon gnocchi!", completed: false },
      { id: "it_5", day: 3, date: "2027-07-12", time: "10:00", title: "Private Boat Day Trip to Capri & Blue Grotto", location: "Amalfi Port Pier 3", category: "Tour", notes: "Skipper Marco booked. Towels, snorkeling masks and drinks included.", completed: false }
    ],
    expenses: [
      { id: "exp_1", title: "Cliffside Positano Villa (7 Nights)", amount: 1800, paidById: "user_alex", splitAmong: ["user_alex", "user_sam", "user_jordan", "user_mia"], category: "Stay", date: "2027-07-10" },
      { id: "exp_2", title: "Rental Van + Full Insurance", amount: 540, paidById: "user_sam", splitAmong: ["user_alex", "user_sam", "user_jordan", "user_mia"], category: "Transport", date: "2027-07-10" },
      { id: "exp_3", title: "Gourmet Grocery Run & Limoncello", amount: 220, paidById: "user_jordan", splitAmong: ["user_alex", "user_sam", "user_jordan", "user_mia"], category: "Food", date: "2027-07-11" },
      { id: "exp_4", title: "Capri Private Boat Charter Deposit", amount: 400, paidById: "user_alex", splitAmong: ["user_alex", "user_sam", "user_jordan", "user_mia"], category: "Activities", date: "2027-07-12" }
    ],
    packingList: [
      { id: "pk_1", item: "Passports & International Drivers License", category: "Documents", assignedTo: "user_alex", done: true },
      { id: "pk_2", item: "First Aid Kit & Motion Sickness Pills", category: "Health", assignedTo: "user_sam", done: true },
      { id: "pk_3", item: "DJI Drone & GoPro with extra batteries", category: "Gear", assignedTo: "user_mia", done: false },
      { id: "pk_4", item: "Portable Waterproof Bluetooth Speaker", category: "Gear", assignedTo: "user_jordan", done: false },
      { id: "pk_5", item: "European Power Adapters (x4)", category: "Gear", assignedTo: "user_sam", done: true }
    ]
  },
  {
    id: "trip_tokyo_2027",
    title: "Tokyo Neon & Sakura Expedition",
    destination: "Tokyo & Kyoto, Japan",
    coverImage: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1600&auto=format&fit=crop&q=80",
    startDate: "2027-10-04",
    endDate: "2027-10-14",
    currency: "JPY",
    currencySymbol: "¥",
    friends: [
      { id: "user_alex", name: "Alex Rivera", email: "alex.travels@example.com", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces", role: "Organizer", color: "#3b82f6" },
      { id: "user_sam", name: "Sam Chen", email: "sam.c@example.com", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces", role: "Navigator", color: "#10b981" }
    ],
    itinerary: [
      { id: "t_1", day: 1, date: "2027-10-04", time: "16:00", title: "Land at Haneda Airport & Suica Cards", location: "Haneda Airport (HND)", category: "Transport", notes: "Get pocket Wi-Fi and load Suica on Apple Wallet.", completed: false },
      { id: "t_2", day: 2, date: "2027-10-05", time: "18:00", title: "Shibuya Crossing & Izakaya Crawl", location: "Shibuya, Tokyo", category: "Food", notes: "Meet at Hachiko statue.", completed: false }
    ],
    expenses: [
      { id: "te_1", title: "JR Pass 7-Day Nationwide", amount: 35000, paidById: "user_alex", splitAmong: ["user_alex", "user_sam"], category: "Transport", date: "2027-10-01" }
    ],
    packingList: [
      { id: "tp_1", item: "JR Pass Exchange Order", category: "Documents", assignedTo: "user_alex", done: true },
      { id: "tp_2", item: "Pocket Wi-Fi Reservation", category: "Gear", assignedTo: "user_sam", done: true }
    ]
  }
];

export function loadAllTrips() {
  try {
    const raw = localStorage.getItem(TRIPS_KEY);
    if (!raw) return DEFAULT_TRIPS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_TRIPS;
  } catch (err) {
    console.warn("Failed to load trips", err);
    return DEFAULT_TRIPS;
  }
}

export function saveAllTrips(trips) {
  try {
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
    return true;
  } catch (err) {
    console.warn("Failed to save trips", err);
    return false;
  }
}

export function loadActiveTripId(trips) {
  try {
    const savedId = localStorage.getItem(ACTIVE_TRIP_ID_KEY);
    if (savedId && trips.some((t) => t.id === savedId)) {
      return savedId;
    }
  } catch {}
  return trips[0]?.id || DEFAULT_TRIPS[0].id;
}

export function saveActiveTripId(tripId) {
  try {
    localStorage.setItem(ACTIVE_TRIP_ID_KEY, tripId);
  } catch {}
}