import { ScreenPerformance, PerformanceMetric } from '@/types/performance';

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private screenMetrics: Map<string, ScreenPerformance[]> = new Map();
  private isEnabled: boolean = __DEV__; // Only in development

  mark(name: string): void {
    if (!this.isEnabled) return;
    performance.mark(name);
  }

  measure(name: string, startMark: string, endMark: string): number {
    if (!this.isEnabled) return 0;
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      return measure?.duration || 0;
    } catch (e) {
      return 0;
    }
  }

  trackScreenNavigation(screenName: string, navigationTime: number): void {
    if (!this.isEnabled) return;

    const metric: ScreenPerformance = {
      screenName,
      navigationTime,
      renderTime: 0,
      interactiveTime: 0,
      memoryUsage: 0,
      fps: 60,
      crashed: false,
    };

    if (!this.screenMetrics.has(screenName)) {
      this.screenMetrics.set(screenName, []);
    }
    this.screenMetrics.get(screenName)?.push(metric);
  }

  getScreenMetrics(screenName: string): ScreenPerformance[] {
    return this.screenMetrics.get(screenName) || [];
  }

  getAverageNavigationTime(screenName: string): number {
    const metrics = this.getScreenMetrics(screenName);
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + m.navigationTime, 0);
    return sum / metrics.length;
  }

  reset(): void {
    this.metrics.clear();
    this.screenMetrics.clear();
  }

  /**
   * ...existing code...
   */
}

export const performanceMonitor = new PerformanceMonitor();