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
