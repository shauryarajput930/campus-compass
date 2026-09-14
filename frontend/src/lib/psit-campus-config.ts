/**
 * PSIT Kanpur Campus Navigation & Map Configuration
 *
 * All coordinates for PSIT Kanpur campus, individual buildings, and map tile layers
 * can be edited directly in this file.
 */

export interface CampusLocation {
  id: string;
  name: string;
  code: string;
  department: string;
  description: string;
  openingTime: string;
  facilities: string[];
  image: string;
  gallery: string[];
  category: "academic" | "hostel" | "sports" | "food" | "facility" | "admin" | "medical";
  lat: number;
  lng: number;
  floors: number;
  rooms: { number: string; type: string; floor: number }[];
}

/**
 * Default Center & Zoom for PSIT Kanpur Campus
 * Address: Kanpur - Agra NH 19 / NH 2, Bhauti, Kanpur, Uttar Pradesh 208020
 */
export const PSIT_CAMPUS_CENTER = {
  lat: 26.450160568018063,
  lng: 80.19200298753422,
  zoom: 17,
  minZoom: 15,
  maxZoom: 19,
};

/**
 * PSIT Campus Bounding Box [SouthWest, NorthEast]
 */
export const PSIT_CAMPUS_BOUNDS: [[number, number], [number, number]] = [
  [26.443, 80.184],
  [26.456, 80.200],
];

/**
 * PSIT Campus Boundary Geofence Polygon [lat, lng][]
 * Outlines the college area as defined on Google Maps / satellite view.
 */
export const PSIT_CAMPUS_POLYGON: [number, number][] = [
  [26.4515, 80.1872],
  [26.4542, 80.1945],
  [26.4548, 80.1970],
  [26.4525, 80.1978],
  [26.4490, 80.1950],
  [26.4460, 80.1925],
  [26.4448, 80.1905],
  [26.4448, 80.1895],
  [26.4475, 80.1870],
  [26.4500, 80.1865],
];

/**
 * Free Map Tile Configuration
 * Defaults to OpenStreetMap (no API key needed).
 * Can be configured with MapTiler or CartoDB via VITE_MAPTILER_KEY if desired.
 */
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY as string | undefined;

export const MAP_TILE_CONFIG = {
  url: MAPTILER_KEY
    ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
    : "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: MAPTILER_KEY
    ? '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  subdomains: ["a", "b", "c"],
  maxZoom: 19,
};

/**
 * PSIT Kanpur Configurable Locations List
 * You can verify and update latitude and longitude coordinates for any location here.
 */
export const PSIT_LOCATIONS: CampusLocation[] = [
  {
    id: "main-gate",
    name: "Main Gate (Entrance)",
    code: "GATE-1",
    department: "Security & Entry",
    description: "Main campus entrance gate on Kanpur-Agra Highway with 24/7 security checkpoint.",
    openingTime: "24 Hours",
    facilities: ["Security Post", "Visitor Registration", "Boom Barrier", "CCTV Monitoring"],
    image: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
    gallery: ["https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80"],
    category: "facility",
    lat: 26.4468,
    lng: 80.1918,
    floors: 1,
    rooms: [{ number: "G-01", type: "Security Control Room", floor: 1 }],
  },
  {
    id: "admin-block",
    name: "Administrative Block",
    code: "ADM",
    department: "Campus Administration",
    description: "Central admin building housing Chairman, Director, Registrar, Accounts, and Admissions offices.",
    openingTime: "9:00 AM – 5:00 PM",
    facilities: ["Reception Desk", "Accounts & Fee Counter", "Registrar Office", "Visitor Lounge"],
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
    gallery: ["https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80"],
    category: "admin",
    lat: 26.4485,
    lng: 80.1915,
    floors: 3,
    rooms: [
      { number: "AD-101", type: "Main Reception", floor: 1 },
      { number: "AD-102", type: "Fee & Accounts Counter", floor: 1 },
      { number: "AD-201", type: "Director Office", floor: 2 },
      { number: "AD-301", type: "Board Room", floor: 3 },
    ],
  },
  {
    id: "main-building",
    name: "Main Building & Central Lawn",
    code: "MB",
    department: "Main Campus Hub",
    description: "Iconic central building overlooking the main fountain lawn and central walkway.",
    openingTime: "8:00 AM – 7:00 PM",
    facilities: ["Central Foyer", "High-speed Wi-Fi", "Elevators", "Information Desk"],
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80",
    gallery: ["https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80"],
    category: "academic",
    lat: 26.4498,
    lng: 80.1918,
    floors: 4,
    rooms: [
      { number: "MB-101", type: "Central Conference Room", floor: 1 },
      { number: "MB-201", type: "Dean Academics", floor: 2 },
    ],
  },
  {
    id: "block-a",
    name: "Academic Block A (CS & IT)",
    code: "AB-A",
    department: "Computer Science & Engineering",
    description: "State-of-the-art academic block for CSE, IT, and AI/ML programs with high-performance labs.",
    openingTime: "8:00 AM – 6:00 PM",
    facilities: ["Smart Classrooms", "AI Research Lab", "High-speed Wi-Fi", "Water Cooler"],
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    gallery: ["https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"],
    category: "academic",
    lat: 26.4504,
    lng: 80.1912,
    floors: 4,
    rooms: [
      { number: "A-101", type: "Smart Classroom 1", floor: 1 },
      { number: "A-201", type: "AI & Data Science Lab", floor: 2 },
      { number: "A-301", type: "HOD CSE Office", floor: 3 },
    ],
  },
  {
    id: "block-b",
    name: "Academic Block B (ECE & EE)",
    code: "AB-B",
    department: "Electronics & Electrical Engg",
    description: "Dedicated block for Electronics & Communication and Electrical Engineering.",
    openingTime: "8:00 AM – 6:00 PM",
    facilities: ["VLSI Lab", "Circuit Workshops", "Faculty Cabins", "Elevator"],
    image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1600&q=80",
    gallery: ["https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1600&q=80"],
    category: "academic",
    lat: 26.4510,
    lng: 80.1916,
    floors: 4,
    rooms: [
      { number: "B-101", type: "Embedded Systems Lab", floor: 1 },
      { number: "B-201", type: "Digital Signal Processing Lab", floor: 2 },
    ],
  },
  {
    id: "block-c",
    name: "Academic Block C (ME & Civil)",
    code: "AB-C",
    department: "Mechanical & Civil Engineering",
    description: "Houses Mechanical, Civil Engineering departments and heavy machinery workshops.",
    openingTime: "8:00 AM – 6:00 PM",
    facilities: ["CAD/CAM Lab", "Fluid Mechanics Lab", "Mechanical Workshop", "Washrooms"],
    image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80",
    gallery: ["https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80"],
    category: "academic",
    lat: 26.4515,
    lng: 80.1920,
    floors: 3,
    rooms: [
      { number: "C-101", type: "Mechanical Workshop", floor: 1 },
      { number: "C-201", type: "AutoCAD & 3D Modeling Lab", floor: 2 },
    ],
  },
  {
    id: "library",
    name: "Central Library",
    code: "LIB",
    department: "Learning Resource Center",
    description: "Air-conditioned 3-floor library featuring 80,000+ volumes, digital e-journals, and silent study zones.",
    openingTime: "8:00 AM – 10:00 PM",
    facilities: ["Digital Library", "E-Journal Kiosks", "Reading Halls", "Photocopy & Print Station"],
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1600&q=80",
    gallery: ["https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80"],
    category: "facility",
    lat: 26.4495,
    lng: 80.1932,
    floors: 3,
    rooms: [
      { number: "L-101", type: "Issue & Return Counter", floor: 1 },
      { number: "L-201", type: "Digital Reference Section", floor: 2 },
      { number: "L-301", type: "Silent Reading Zone", floor: 3 },
    ],
  },
  {
    id: "canteen",
    name: "Main Canteen & Food Court",
    code: "CAN",
    department: "Student Dining Services",
    description: "Vibrant food court offering South Indian, North Indian, Chinese, snacks, and fresh juices.",
    openingTime: "8:00 AM – 9:30 PM",
    facilities: ["Multi-Cuisine Stalls", "Indoor & Outdoor Seating", "Nescafe Kiosk", "RO Drinking Water"],
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
    gallery: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80"],
    category: "food",
    lat: 26.4512,
    lng: 80.1905,
    floors: 1,
    rooms: [{ number: "CAN-01", type: "Central Food Court Hall", floor: 1 }],
  },
  {
    id: "auditorium",
    name: "Main Auditorium",
    code: "AUD",
    department: "Cultural & Events Center",
    description: "Air-conditioned 1,500-seat auditorium equipped with modern acoustic and lighting systems.",
    openingTime: "8:30 AM – 8:00 PM",
    facilities: ["Dolby Surround Sound", "Green Rooms", "Stage Lighting", "VIP Seating"],
    image: "https://images.unsplash.com/photo-1503428593586-e225b39bddfe?auto=format&fit=crop&w=1600&q=80",
    gallery: ["https://images.unsplash.com/photo-1503428593586-e225b39bddfe?auto=format&fit=crop&w=1600&q=80"],
    category: "facility",
    lat: 26.4508,
    lng: 80.1928,
    floors: 2,
    rooms: [{ number: "AUD-01", type: "Main Auditorium Hall", floor: 1 }],
  },
  {
    id: "labs",
    name: "Innovation & Robotics Lab",
    code: "INNO",
    department: "Research & Development",
    description: "Hub for student innovation, IoT projects, robotics prototyping, and 3D printing.",
    openingTime: "8:00 AM – 7:00 PM",
    facilities: ["3D Printers", "PCB Fabricator", "Robotics Bench", "High-speed Internet"],
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    gallery: ["https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80"],
    category: "academic",
    lat: 26.4508,
    lng: 80.1895,
    floors: 2,
    rooms: [
      { number: "IN-101", type: "Robotics Workshop", floor: 1 },
      { number: "IN-201", type: "IoT Prototyping Space", floor: 2 },
    ],
  },
  {
    id: "hostel-boys",
    name: "Boys Hostel Complex",
    code: "BH",
    department: "Student Housing",
    description: "Modern residential block for male students with in-house mess, indoor sports, and study halls.",
    openingTime: "24 Hours (Gate curfew applies)",
    facilities: ["Dining Mess", "Gymnasium Room", "High-speed Wi-Fi", "24/7 Power Backup"],
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1600&q=80",
    gallery: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1600&q=80"],
    category: "hostel",
    lat: 26.4528,
    lng: 80.1935,
    floors: 5,
    rooms: [{ number: "BH-101", type: "Warden Office", floor: 1 }],
  },
  {
    id: "hostel-girls",
    name: "Girls Hostel Complex",
    code: "GH",
    department: "Student Housing",
    description: "Secure, comfortable hostel for female students with dedicated wardens, mess, and green court.",
    openingTime: "24 Hours (Gate curfew applies)",
    facilities: ["Dining Mess", "24/7 Female Security", "Common Room", "Laundry Station"],
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1600&q=80",
    gallery: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1600&q=80"],
    category: "hostel",
    lat: 26.4525,
    lng: 80.1945,
    floors: 5,
    rooms: [{ number: "GH-101", type: "Warden Office", floor: 1 }],
  },
  {
    id: "parking",
    name: "Central Parking Area",
    code: "PARK",
    department: "Campus Infrastructure",
    description: "Spacious shaded parking area for two-wheelers, four-wheelers, and visitor vehicles.",
    openingTime: "6:00 AM – 10:00 PM",
    facilities: ["EV Charging Points", "Covered Sheds", "CCTV Security", "Token Verification"],
    image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80",
    gallery: ["https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80"],
    category: "facility",
    lat: 26.4475,
    lng: 80.1908,
    floors: 1,
    rooms: [{ number: "P-01", type: "Parking Control Booth", floor: 1 }],
  },
  {
    id: "sports",
    name: "Sports Complex & Gymnasium",
    code: "SPC",
    department: "Physical Education",
    description: "Outdoor cricket ground, football pitch, basketball court, and indoor badminton courts.",
    openingTime: "6:00 AM – 8:00 PM",
    facilities: ["Basketball Court", "Cricket Practice Nets", "Gym Fitness Center", "Badminton Court"],
    image: "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1600&q=80",
    gallery: ["https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1600&q=80"],
    category: "sports",
    lat: 26.4505,
    lng: 80.1882,
    floors: 2,
    rooms: [
      { number: "SP-101", type: "Sports Equipment Room", floor: 1 },
      { number: "SP-201", type: "Fitness Gym", floor: 2 },
    ],
  },
  {
    id: "medical",
    name: "Medical & First Aid Center",
    code: "MED",
    department: "Health Services",
    description: "Campus health center providing 24/7 emergency medical assistance, doctor consultation, and ambulance service.",
    openingTime: "24 Hours",
    facilities: ["24/7 Ambulance", "Resident Doctor", "First Aid Room", "Pharmacy Desk"],
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
    gallery: ["https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80"],
    category: "medical",
    lat: 26.4490,
    lng: 80.1902,
    floors: 1,
    rooms: [
      { number: "M-101", type: "Doctor Consultation Room", floor: 1 },
      { number: "M-102", type: "Emergency Ward", floor: 1 },
    ],
  },
  {
    id: "placement",
    name: "Placement & Corporate Cell",
    code: "CRT",
    department: "Career Development Center",
    description: "Dedicated block for campus recruitment drives, mock interview rooms, and corporate interactions.",
    openingTime: "9:00 AM – 6:00 PM",
    facilities: ["Interview Cabins", "GD Conference Rooms", "Presentation Hall", "AC Lounge"],
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
    gallery: ["https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80"],
    category: "admin",
    lat: 26.4490,
    lng: 80.1926,
    floors: 2,
    rooms: [
      { number: "PC-101", type: "Corporate Reception", floor: 1 },
      { number: "PC-201", type: "Group Discussion Room", floor: 2 },
    ],
  },
  {
    id: "oat",
    name: "Open Air Theatre (OAT)",
    code: "OAT",
    department: "Student Life & Cultural",
    description: "Open amphitheatre for student fests, music performances, street plays, and evening gatherings.",
    openingTime: "7:00 AM – 9:00 PM",
    facilities: ["Tiered Seating", "Open Stage", "Ambient Lighting"],
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    gallery: ["https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80"],
    category: "facility",
    lat: 26.4502,
    lng: 80.1925,
    floors: 1,
    rooms: [{ number: "OAT-01", type: "Stage Area", floor: 1 }],
  },
  {
    id: "atm",
    name: "Campus ATM & Bank Kiosk",
    code: "ATM",
    department: "Financial Services",
    description: "24/7 multi-bank ATM kiosk (SBI & Punjab National Bank) for instant cash withdrawal.",
    openingTime: "24 Hours",
    facilities: ["24/7 ATM", "Passbook Printing Machine", "CCTV Security"],
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    gallery: ["https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80"],
    category: "facility",
    lat: 26.4488,
    lng: 80.1922,
    floors: 1,
    rooms: [{ number: "ATM-01", type: "Kiosk", floor: 1 }],
  },
];

/**
 * PSIT Internal Pedestrian Path Waypoints
 * Ensures clean internal campus walking paths even if OpenStreetMap
 * lacks detailed internal pedestrian tracks.
 */
export const INTERNAL_CAMPUS_PATH_NODES = [
  { id: "p1", lat: 26.4468, lng: 80.1918 }, // Main Gate
  { id: "p2", lat: 26.4475, lng: 80.1912 }, // Parking & Entrance
  { id: "p3", lat: 26.4485, lng: 80.1915 }, // Admin Block
  { id: "p4", lat: 26.4498, lng: 80.1918 }, // Main Building Foyer
  { id: "p5", lat: 26.4504, lng: 80.1912 }, // Block A Junction
  { id: "p6", lat: 26.4510, lng: 80.1916 }, // Block B Junction
  { id: "p7", lat: 26.4515, lng: 80.1920 }, // Block C Junction
  { id: "p8", lat: 26.4495, lng: 80.1932 }, // East Corridor (Library)
  { id: "p9", lat: 26.4512, lng: 80.1905 }, // Canteen Plaza
  { id: "p10", lat: 26.4528, lng: 80.1935 }, // Hostel Avenue
  { id: "p11", lat: 26.4490, lng: 80.1902 }, // West Corridor (Medical & Labs)
];
