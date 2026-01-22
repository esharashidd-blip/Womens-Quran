// Types for Guided Programs - 30-Day Structure
// Each day MUST include all sections (no optional sections)
export interface DayContent {
  dayNumber: number;
  title: string;
  // New 7-Step Structure (Gradual Migration)
  introAudio?: {
    title: string;
    duration: string;
    audioUrl: string;
    description: string;
  };
  ayahStudy?: {
    arabic: string;
    translation: string;
    reference: string;
    emotionalExplanation: string;
    context: string;
    revelationContext: string;
    audioUrl: string;
  };
  multiPartStory?: {
    audioUrl?: string;
    quranicStory: {
      title: string;
      content: string;
    };
    sisterScenario: {
      content: string;
    };
    connection: string;
  };
  reflectionPrompts?: string[];
  realLifeAction?: {
    emotional: string;
    spiritual: string;
    practical: string;
  };
  journalPrompts?: string[];
  closingRitual?: {
    dua: string;
    reassurance: string;
    restPermission: string;
  };

  // Deprecated fields (to be removed after migration)
  quranAudio?: any;
  openingAudio?: any;
  ayah?: any;
  story?: any;
  guidedReflection?: any;
  actionStep?: any;
  dua?: any;
  emotionalCheckIn?: any;
  closingReassurance?: string;
  visualReflection?: any;
  application?: any;

  illustration?: {
    type: 'light' | 'nature' | 'mosque' | 'abstract';
    description: string;
  };
  isWeeklyDepth?: boolean;
}

export interface GuidedProgram {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  daysCount: 21 | 30; // Usually 21 or 30 days
  category: string;
  description: string;
  weeklyDepthDays: number[]; // Days 7, 14, 21, 28 for deeper reflection
  days: DayContent[];
}

// Import all programs
import { anxietyProgram } from './anxiety-program';
import { heartbreakProgram } from './heartbreak-program';
import { sadnessProgram } from './sadness-program';
import { overthinkingProgram } from './overthinking-program';
import { lonelinessProgram } from './loneliness-program';
import { lowImanProgram } from './low-iman-program';
import { stressProgram } from './stress-program';
import { griefProgram } from './grief-program';
import { angerProgram } from './anger-program';
import { confusionProgram } from './confusion-program';
import { envyProgram } from './envy-program';
import { patienceProgram } from './patience-program';
import { gratitudeProgram } from './gratitude-program';

// Export all programs as an array
export const GUIDED_PROGRAMS: GuidedProgram[] = [
  anxietyProgram,
  heartbreakProgram,
  sadnessProgram,
  overthinkingProgram,
  lonelinessProgram,
  lowImanProgram,
  stressProgram,
  griefProgram,
  angerProgram,
  confusionProgram,
  envyProgram,
  patienceProgram,
  gratitudeProgram,
];

// Export individual programs
export {
  anxietyProgram,
  heartbreakProgram,
  sadnessProgram,
  overthinkingProgram,
  lonelinessProgram,
  lowImanProgram,
  stressProgram,
  griefProgram,
  angerProgram,
  confusionProgram,
  envyProgram,
  patienceProgram,
  gratitudeProgram,
};
