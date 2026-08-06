export interface Building {
  id: string;
  name: string;
  code: string;
  department: string;
  description: string;
  openingTime: string;
  facilities: string[];
  image: string;
  gallery: string[];
  category: "academic" | "hostel" | "sports" | "food" | "facility" | "admin";
  lat: number;
  lng: number;
  floors: number;
  rooms: { number: string; type: string; floor: number }[];
}

// Coords loosely around PSIT Kanpur; admin can edit.
export const buildings: Building[] = [
  {
    id: "block-a",
    name: "Academic Block A",
    code: "AB-A",
    department: "Computer Science & Engineering",
    description:
      "Home to the CSE department with modern classrooms, project labs and faculty offices.",
    openingTime: "8:00 AM – 6:00 PM",
    facilities: ["Smart Classrooms", "Wi-Fi", "Elevator", "Water Cooler", "Washroom"],
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    ],
    category: "academic",
    lat: 26.5361, lng: 80.2456,
    floors: 4,
    rooms: [
      { number: "A-101", type: "Classroom", floor: 1 },
      { number: "A-102", type: "Classroom", floor: 1 },
      { number: "A-201", type: "AI Lab", floor: 2 },
      { number: "A-202", type: "Networking Lab", floor: 2 },
      { number: "A-301", type: "HOD Office", floor: 3 },
    ],
  },
  {
    id: "block-b",
    name: "Academic Block B",
    code: "AB-B",
    department: "Electronics & Mechanical",
    description: "Houses ECE and ME departments with dedicated workshops and lecture halls.",
    openingTime: "8:00 AM – 6:00 PM",
    facilities: ["Workshops", "Lecture Halls", "Faculty Room", "Washroom"],
    image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80",
    ],
    category: "academic",
    lat: 26.5365, lng: 80.2462,
    floors: 3,
    rooms: [
      { number: "B-101", type: "Lecture Hall", floor: 1 },
      { number: "B-201", type: "Electronics Lab", floor: 2 },
      { number: "B-301", type: "Workshop", floor: 3 },
    ],
  },
  {
    id: "library",
    name: "Central Library",
    code: "LIB",
    department: "Learning Resource Centre",
    description: "Multi-storey library with 60,000+ titles, digital repository and reading halls.",
    openingTime: "8:00 AM – 10:00 PM",
    facilities: ["Reading Halls", "Digital Section", "Journals", "Xerox", "Silent Zone"],
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80",
    ],
    category: "facility",
    lat: 26.5358, lng: 80.2468,
    floors: 3,
    rooms: [
      { number: "L-G", type: "Reading Hall", floor: 0 },
      { number: "L-1", type: "Digital Library", floor: 1 },
      { number: "L-2", type: "Reference Section", floor: 2 },
    ],
  },
  {
    id: "auditorium",
    name: "Main Auditorium",
    code: "AUD",
    department: "Cultural & Events",
    description: "1200-seat auditorium for conferences, cultural events and guest lectures.",
    openingTime: "By Event",
    facilities: ["Stage", "Green Rooms", "Projection", "AC"],
    image: "https://images.unsplash.com/photo-1503428593586-e225b39bddfe?auto=format&fit=crop&w=1600&q=80",
    gallery: [],
    category: "facility",
    lat: 26.5352, lng: 80.246,
    floors: 2,
    rooms: [{ number: "AUD-Hall", type: "Main Hall", floor: 0 }],
  },
  {
    id: "canteen",
    name: "Central Canteen",
    code: "CAN",
    department: "Food Court",
    description: "Multi-cuisine food court with 12+ outlets and outdoor seating.",
    openingTime: "8:00 AM – 9:00 PM",
    facilities: ["Multi-cuisine", "Outdoor Seating", "Wi-Fi", "Washroom"],
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
    gallery: [],
    category: "food",
    lat: 26.5368, lng: 80.2451,
    floors: 1,
    rooms: [{ number: "CAN-01", type: "Food Court", floor: 0 }],
  },
  {
    id: "hostel-boys",
    name: "Boys Hostel",
    code: "HB",
    department: "Residential",
    description: "Residential facility for 500+ students with mess and recreation area.",
    openingTime: "24 Hours",
    facilities: ["Mess", "Gym", "Common Room", "Wi-Fi", "Laundry"],
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1600&q=80",
    gallery: [],
    category: "hostel",
    lat: 26.5378, lng: 80.2478,
    floors: 5,
    rooms: [{ number: "H-101", type: "Warden Office", floor: 1 }],
  },
  {
    id: "sports",
    name: "Sports Complex",
    code: "SPC",
    department: "Physical Education",
    description: "Cricket, football, basketball courts and indoor games hall.",
    openingTime: "6:00 AM – 8:00 PM",
    facilities: ["Cricket Ground", "Basketball", "Indoor Games", "Gym"],
    image: "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1600&q=80",
    gallery: [],
    category: "sports",
    lat: 26.5345, lng: 80.2472,
    floors: 1,
    rooms: [{ number: "SP-01", type: "Indoor Hall", floor: 0 }],
  },
  {
    id: "admin",
    name: "Admin Block",
    code: "ADM",
    department: "Administration",
    description: "Director, Registrar, Accounts, Examination and Placement offices.",
    openingTime: "9:00 AM – 5:00 PM",
    facilities: ["Reception", "Accounts", "Placement Cell", "Exam Cell"],
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
    gallery: [],
    category: "admin",
    lat: 26.5355, lng: 80.2445,
    floors: 3,
    rooms: [
      { number: "AD-101", type: "Reception", floor: 1 },
      { number: "AD-201", type: "Placement Cell", floor: 2 },
    ],
  },
];

export const departments = [
  "Computer Science & Engineering",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Information Technology",
  "MBA",
  "MCA",
  "Applied Sciences",
];

export const stats = {
  departments: 12,
  buildings: 24,
  labs: 60,
  students: 8500,
};
