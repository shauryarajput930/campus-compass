import mongoose from "mongoose";
import Building from "../models/Building.js";

const DEFAULT_INITIAL_BUILDINGS = [
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
    code: "ADM-01",
    department: "Administration & Management",
    description: "Central administrative building containing Director's Office, Registrar Office, Admissions, Registrar Branch & Accounts Department.",
    openingTime: "09:00 AM - 05:00 PM",
    facilities: ["Admissions Cell", "Director Office", "Fee Counters", "Conference Hall", "RO Water"],
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    gallery: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"],
    category: "admin",
    lat: 26.4485,
    lng: 80.1925,
    floors: 3,
    rooms: [
      { number: "ADM-101", type: "Admissions Desk", floor: 1 },
      { number: "ADM-102", type: "Accounts & Fee Cell", floor: 1 },
      { number: "ADM-201", type: "Director Office", floor: 2 },
      { number: "ADM-301", type: "Board Room", floor: 3 },
    ],
  },
  {
    id: "cse-block",
    name: "Computer Science & Engineering Block",
    code: "CSE-02",
    department: "Computer Science & Engineering",
    description: "State-of-the-art academic building housing AI & ML labs, IoT research centers, cloud computing labs and smart lecture halls.",
    openingTime: "08:30 AM - 06:00 PM",
    facilities: ["High-speed Wi-Fi", "Air Conditioned Labs", "Smart Classrooms", "Project Workstations"],
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    gallery: ["https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80"],
    category: "academic",
    lat: 26.4502,
    lng: 80.1932,
    floors: 4,
    rooms: [
      { number: "CS-101", type: "AI & ML Innovation Lab", floor: 1 },
      { number: "CS-204", type: "Data Science Research Lab", floor: 2 },
      { number: "CS-302", type: "Smart Classroom", floor: 3 },
      { number: "CS-401", type: "IoT & Embedded Systems Lab", floor: 4 },
    ],
  },
  {
    id: "central-library",
    name: "Central Knowledge Library",
    code: "LIB-01",
    department: "Library & Information Services",
    description: "Fully automated digital library with access to IEEE Xplore, ScienceDirect, thousands of reference books, journals and quiet study rooms.",
    openingTime: "08:00 AM - 09:00 PM",
    facilities: ["E-Resource Center", "Quiet Reading Zones", "Discussion Rooms", "Reprography Desk"],
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
    gallery: ["https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80"],
    category: "academic",
    lat: 26.4495,
    lng: 80.1915,
    floors: 3,
    rooms: [
      { number: "LIB-101", type: "Circulation Counter & Issue Desk", floor: 1 },
      { number: "LIB-201", type: "Digital Reference & E-Journal Lab", floor: 2 },
      { number: "LIB-301", type: "Research & Periodicals Section", floor: 3 },
    ],
  },
  {
    id: "central-food-court",
    name: "Central Food Court & Dining",
    code: "FC-01",
    department: "Hospitality & Dining",
    description: "Multi-cuisine dining facility featuring Nescafe outlet, Amul parlor, South Indian & North Indian multi-vendor food court.",
    openingTime: "07:30 AM - 10:00 PM",
    facilities: ["Indoor Air-Conditioned Seating", "Outdoor Patio", "Digital UPI Payments", "Hygiene Checked"],
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    gallery: ["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"],
    category: "food",
    lat: 26.4510,
    lng: 80.1940,
    floors: 2,
    rooms: [
      { number: "FC-01", type: "Multi-Cuisine Counter", floor: 1 },
      { number: "FC-02", type: "Nescafe & Bakery Lounge", floor: 1 },
      { number: "FC-201", type: "Executive Staff Dining Hall", floor: 2 },
    ],
  },
  {
    id: "boys-hostel-complex",
    name: "Boys Hostel Complex (Raman & Kalam Block)",
    code: "BH-01",
    department: "Hostel & Residential Services",
    description: "Secure residential rooms with attached washrooms, high-speed Wi-Fi, indoor games, gymnasium and 24/7 power backup.",
    openingTime: "24 Hours (In-time 09:30 PM)",
    facilities: ["24/7 Security & Warden", "In-house Gym", "Laundry Service", "Common TV Room"],
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
    gallery: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80"],
    category: "hostel",
    lat: 26.4528,
    lng: 80.1952,
    floors: 5,
    rooms: [
      { number: "BH-101", type: "Warden Office & Helpdesk", floor: 1 },
      { number: "BH-102", type: "Common Recreation & Gym Room", floor: 1 },
    ],
  },
  {
    id: "girls-hostel-complex",
    name: "Girls Hostel Complex (Gargi Block)",
    code: "GH-01",
    department: "Hostel & Residential Services",
    description: "Dedicated high-security residence for female students with biometrics, night warden, sports ground and infirmary.",
    openingTime: "24 Hours (In-time 08:30 PM)",
    facilities: ["Biometric Access Control", "Female Security Staff", "Study Hall", "Medical Aid Room"],
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
    gallery: ["https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80"],
    category: "hostel",
    lat: 26.4478,
    lng: 80.1942,
    floors: 5,
    rooms: [
      { number: "GH-101", type: "Main Security & Biometric Gate", floor: 1 },
      { number: "GH-105", type: "Medical Aid & Health Desk", floor: 1 },
    ],
  },
  {
    id: "sports-complex",
    name: "Sports Complex & Athletic Stadium",
    code: "SPT-01",
    department: "Physical Education & Sports",
    description: "Multi-purpose sports area including synthetic basketball courts, badminton hall, cricket ground and lawn tennis courts.",
    openingTime: "06:00 AM - 08:00 PM",
    facilities: ["Cricket Pavilion", "Synthetic Basketball Court", "Badminton Arena", "Floodlights"],
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
    gallery: ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80"],
    category: "sports",
    lat: 26.4535,
    lng: 80.1910,
    floors: 1,
    rooms: [
      { number: "SPT-01", type: "Sports Equipment Office", floor: 1 },
      { number: "SPT-02", type: "Indoor Badminton Hall", floor: 1 },
    ],
  },
  {
    id: "medical-center",
    name: "Campus Medical Center & Infirmary",
    code: "MED-01",
    department: "Health & Emergency Services",
    description: "Round-the-clock medical facility with resident medical officer, 24/7 emergency ambulance service and pharmacy.",
    openingTime: "24 Hours",
    facilities: ["24/7 Resident Doctor", "Emergency Ambulance", "Basic Pharmacy", "First Aid Unit"],
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
    gallery: ["https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80"],
    category: "medical",
    lat: 26.4489,
    lng: 80.1902,
    floors: 1,
    rooms: [
      { number: "MED-01", type: "Doctor Consultation Room", floor: 1 },
      { number: "MED-02", type: "Emergency Observation Ward", floor: 1 },
    ],
  }
];

export async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.warn("[DB] MONGODB_URI/MONGO_URI missing in environment variables");
    return;
  }
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(uri);
    console.log("[DB] MongoDB connected successfully");

    // Auto-seed initial default campus buildings if collection is empty
    const count = await Building.countDocuments();
    if (count === 0) {
      console.log("[DB] Seeding default campus locations into MongoDB...");
      await Building.insertMany(DEFAULT_INITIAL_BUILDINGS);
      console.log("[DB] Successfully seeded default campus locations");
    }
  } catch (err) {
    console.error("[DB] Mongo connection error:", err.message);
  }
}


