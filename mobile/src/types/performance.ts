export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'mb' | 'percent';
  timestamp: number;
  threshold?: number;
}

export interface ScreenPerformance {
  screenName: string;
  navigationTime: number; // ms to appear
  renderTime: number; // ms first paint
  interactiveTime: number; // ms to interactive
  memoryUsage: number; // mb
  fps: number;
  crashed: boolean;
}

export interface PerformanceSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  screens: ScreenPerformance[];
  totalMemoryPeak: number; // mb
  averageFps: number;
  crashes: number;
}

export interface A11yIssue {
  type: 'contrast' | 'touchTarget' | 'label' | 'semantics';
  severity: 'critical' | 'high' | 'medium' | 'low';
  element: string;
  message: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
}
