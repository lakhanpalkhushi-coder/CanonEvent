export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO or date string
  progress: number; // 0 to 100
  originalRisk: 'Low' | 'Medium' | 'High' | 'Catastrophic';
  currentRisk: 'Low' | 'Medium' | 'High' | 'Catastrophic';
  createdAt: string;
}

export interface Timeline {
  id: string;
  taskId: string;
  type: 'A' | 'B' | 'C'; // A: Sacred, B: Nexus, C: Absolute (Canon Event)
  name: string;
  probability: number; // 0 to 100
  stressLevel: number; // 0 to 100
  description: string;
  consequences: string;
  dayByDayPlan: {
    day: string;
    action: string;
    stressLevel: number;
  }[];
}

export interface MicroMission {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedMinutes: number;
}

export interface DailyReflection {
  id: string;
  date: string;
  completedCount: number;
  totalCount: number;
  procrastinationIndex: number; // 0 to 100
  futureSelfLog: string;
  actionableTip: string;
  coachingAdvice?: {
    procrastinationTriggers: string[];
    personalizedAdvice: string;
    actionableTips: string[];
    motivationalMessage: string;
  };
}

export interface ChronoDiagnostics {
  futureSelfTransmission: {
    timelineId: string;
    currentDate: string;
    transmission: string;
    mistake: string;
    feeling: string;
    changeable: string;
    warning: string;
  };
  failurePrediction: {
    canonEventName: string;
    pointOfNoReturn: string;
    chainOfDecisions: string[];
    temporalConsequences: string;
    emotionalConsequences: string;
    projectConsequences: string;
    successProbabilityAfterEvent: number;
  };
  observerReport: {
    observedBehavior: string;
    timelineDrift: string;
    riskIndicators: string[];
    predictedFailureModes: string[];
    anomalies: string[];
    recommendedIntervention: string;
  };
  replayLog: {
    day: string;
    decisionTaken: string;
    immediateEffect: string;
    hiddenConsequence: string;
  }[];
  recoveryPlan: {
    criticalPath: string[];
    next15Minutes: string[];
    next60Minutes: string[];
    next24Hours: string[];
    nonEssentialTasks: string[];
    successProbabilityAfterIntervention: number;
  };
  spokenMessage: {
    text: string;
  };
  canonCore: {
    currentTrajectory: string;
    timelineStability: number;
    primaryThreat: string;
    projectedCanonEvent: string;
    futureSelfWarning: string;
    recoveryProbability: number;
  };
  coachingAdvice: {
    procrastinationTriggers: string[];
    personalizedAdvice: string;
    actionableTips: string[];
    motivationalMessage: string;
  };
  salvagedResources: {
    title: string;
    url: string;
    description: string;
    value: string;
  }[];
}

export interface JudgeQA {
  id: string;
  question: string;
  category: 'Innovation' | 'Technical' | 'Business' | 'Demo' | 'Vibe';
  answer: string;
  keyTakeaway: string;
}

export interface PitchSlide {
  id: string;
  title: string;
  subtitle?: string;
  points: string[];
  visualType: 'critique' | 'versions' | 'scorecard' | 'architecture' | 'business' | 'script';
}

export interface UserProfile {
  name: string;
  codename: string;
  motto: string;
  avatarId: string;
  era: string;
}


