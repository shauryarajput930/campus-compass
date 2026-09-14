import { PSIT_LOCATIONS, type CampusLocation } from "./psit-campus-config";

export interface Building {
  id: string;
  name: string;
  code: string;
  icon?: string;
  department: string;
  programs?: string[];
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
 * PSIT Kanpur Campus Buildings
 * Synchronized with central psit-campus-config.ts
 */
export const buildings: Building[] = PSIT_LOCATIONS as Building[];

export const academicPrograms = {
  engineering: [
    "B.Tech - Computer Science and Engineering (CSE)",
    "B.Tech - CSE with Artificial Intelligence & Machine Learning",
    "B.Tech - Artificial Intelligence & Data Science",
    "B.Tech - CSE (Data Science)",
    "B.Tech - CSE (Internet of Things)",
    "B.Tech - CSE (Cyber Security)",
    "B.Tech - Electronics & Communication Engineering (ECE)",
    "B.Tech - Information Technology (IT)",
    "B.Tech - Mechanical Engineering",
    "B.Tech - Civil Engineering",
    "B.Tech - Electrical Engineering",
    "B.Tech - Chemical Engineering",
    "B.Tech - Biotechnology",
    "B.Tech - Mechatronics",
    "M.Tech - Computer Science",
    "M.Tech - VLSI Design",
    "M.Tech - Machine Learning",
  ],
  managementAndApplications: [
    "Bachelor of Business Administration (BBA)",
    "Bachelor of Computer Applications (BCA)",
    "Master of Business Administration (MBA / PGDM)",
    "Master of Computer Applications (MCA)",
  ],
  pharmacy: [
    "Bachelor of Pharmacy (B.Pharm)",
    "Master of Pharmacy (M.Pharm) - Pharmaceutics",
    "Master of Pharmacy (M.Pharm) - Pharmacology",
  ],
} as const;

export const departments = [
  ...academicPrograms.engineering,
  ...academicPrograms.managementAndApplications,
  ...academicPrograms.pharmacy,
  "Security & Entry",
  "Campus Administration",
  "Main Campus Hub",
  "Learning Resource Center",
  "Student Dining Services",
  "Cultural & Events Center",
  "Research & Development",
  "Student Housing",
  "Campus Infrastructure",
  "Physical Education",
  "Health Services",
  "Career Development Center",
  "Student Life & Cultural",
  "Financial Services",
];

export function normalizeDepartmentName(value: string): string {
  const aliases: Record<string, string> = {
    "Computer Science & Engineering": "B.Tech - Computer Science and Engineering (CSE)",
    "Electronics & Electrical Engg": "B.Tech - Electronics & Communication Engineering (ECE)",
    "Mechanical & Civil Engineering": "B.Tech - Mechanical Engineering",
  };
  return aliases[value] ?? value;
}

export const stats = {
  departments: academicPrograms.engineering.length + academicPrograms.managementAndApplications.length + academicPrograms.pharmacy.length,
  buildings: 18,
  labs: 65,
  students: 10500,
};
