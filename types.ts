
export enum Page {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  HOME = 'HOME',
  CAMERA = 'CAMERA',
  UPLOAD = 'UPLOAD',
  RESULTS = 'RESULTS',
  ABOUT = 'ABOUT',
  PRIVACY = 'PRIVACY',
  SETTINGS = 'SETTINGS',
  DASHBOARD = 'DASHBOARD',
}

export interface ClassificationResult {
  itemType: string;
  binCategory: string; // "Recycle", "Compost", "Landfill", "E-Waste"
  confidence: number;
  tip: string;
  funFact: string;
}

export interface UserSettings {
  highContrast: boolean;
  largeText: boolean;
  language: string;
}

export interface Challenge {
  id: string;
  description: string;
  target: number;
  current: number;
  type: 'category' | 'count' | 'prediction' | 'streak' | 'confidence' | 'time';
  value?: string;
}

export interface User {
  name: string;
  email: string;
  photo?: string;
}

export interface UserData {
  user: User | null;
  xp: number;
  level: number;
  streak: number;
  lastScanDate: string | null;
  totalScans: number;
  correctPredictions: number;
  consecutiveCorrect: number;
  badges: string[];
  completedChallenges: string[]; // Store dates of completion
  currentChallenge: Challenge | null;
  history: Array<{
    id: string;
    itemType: string;
    binCategory: string;
    date: string;
  }>;
}
