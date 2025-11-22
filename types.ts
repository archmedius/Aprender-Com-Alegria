export enum Subject {
  PORTUGUESE = 'PORTUGUESE',
  MATH = 'MATH',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum ExerciseType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  READING_ALOUD = 'READING_ALOUD', // Requires microphone
  FILL_BLANK = 'FILL_BLANK',
}

export interface Exercise {
  id: string;
  subject: Subject;
  type: ExerciseType;
  question: string; // The text prompt
  options?: string[]; // For multiple choice
  correctAnswer: string; // Expected answer or text to read
  explanation: string; // Why it is correct
  visualHint?: string; // Emoji or short description for image generation later
}

export interface UserProgress {
  name: string;
  levelMath: number;
  levelPort: number;
  points: number;
  badges: string[];
  history: {
    date: string;
    score: number;
    subject: Subject;
  }[];
}

export interface GameState {
  currentView: 'WELCOME' | 'DIAGNOSTIC' | 'DASHBOARD' | 'EXERCISE' | 'SETTINGS';
  selectedSubject?: Subject;
}
