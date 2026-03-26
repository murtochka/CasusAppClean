import { A11yIssue } from '@/types/performance';
import { Colors } from '@/constants/Colors';

/**
 * Calculate contrast ratio between two colors
 * WCAG standard: 4.5:1 for normal text, 3:1 for large text
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(hex: string): number {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Validate color contrast for WCAG compliance
 */
export function validateContrast(
  foreground: string,
  background: string,
  level: 'A' | 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): { passes: boolean; ratio: number; required: number } {
  const ratio = getContrastRatio(foreground, background);

  const requirements: Record<string, Record<string, number>> = {
    A: { normal: 3, large: 3 },
    AA: { normal: 4.5, large: 3 },
    AAA: { normal: 7, large: 4.5 },
  };

  const required = isLargeText
    ? requirements[level].large
    : requirements[level].normal;

  return {
    passes: ratio >= required,
    ratio: Number(ratio.toFixed(2)),
    required,
  };
}

/**
 * Validate critical color combinations
 */
export function auditColorContrast(): A11yIssue[] {
  const issues: A11yIssue[] = [];

  // Check primary colors
  const combinations = [
    { fg: Colors.primaryShades[600], bg: Colors.surface, element: 'Primary button text' },
    { fg: Colors.neutral[900], bg: Colors.background, element: 'Body text' },
    { fg: Colors.neutral[600], bg: Colors.surface, element: 'Secondary text' },
    { fg: Colors.accentShades[500], bg: Colors.surface, element: 'Accent text' },
  ];

  combinations.forEach(({ fg, bg, element }) => {
    const validation = validateContrast(fg, bg, 'AA');
    if (!validation.passes) {
      issues.push({
        type: 'contrast',
        severity: 'high',
        element,
        message: `Contrast ratio ${validation.ratio}:1 (required: ${validation.required}:1)`,
        wcagLevel: 'AA',
      });
    }
  });

  return issues;
}

/**
 * Validate touch target sizes (minimum 44x44pt on iOS, 48x48dp on Android)
 */
export function validateTouchTarget(
  width: number,
  height: number,
  platform: 'ios' | 'android' = 'ios'
): { passes: boolean; size: number; minimum: number } {
  const minimum = platform === 'ios' ? 44 : 48;
  const size = Math.min(width, height);
  return {
    passes: size >= minimum,
    size,
    minimum,
  };
}

/**
 * Validate accessible naming
 */
export function validateAccessibleName(
  name: string | undefined,
  element: string
): A11yIssue | null {
  if (!name || name.trim().length === 0) {
    return {
      type: 'label',
      severity: 'critical',
      element,
      message: 'Missing accessible name/label',
      wcagLevel: 'A',
    };
  }
  return null;
}

/**
 * Check for semantic structure
 */
export function validateSemanticOrder(
  headingLevels: number[]
): A11yIssue[] {
  const issues: A11yIssue[] = [];

  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] > headingLevels[i - 1] + 1) {
      issues.push({
        type: 'semantics',
        severity: 'medium',
        element: `Heading level jump from H${headingLevels[i - 1]} to H${headingLevels[i]}`,
        message: 'Skipped heading levels reduce accessibility',
        wcagLevel: 'A',
      });
    }
  }

  return issues;
}
