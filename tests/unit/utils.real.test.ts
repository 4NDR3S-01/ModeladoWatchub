import { describe, it, expect } from 'vitest';
import { cn } from '../../src/lib/utils';

describe('Utils Library - Real Implementation', () => {
  it('should merge class names correctly', () => {
    const result = cn('base-class', 'additional-class');
    expect(result).toContain('base-class');
    expect(result).toContain('additional-class');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isHidden = false;
    const result = cn('base-class', isActive && 'active', isHidden && 'hidden');
    expect(result).toContain('base-class');
    expect(result).toContain('active');
    expect(result).not.toContain('hidden');
  });

  it('should handle undefined and null values', () => {
    const result = cn('base-class', undefined, null, 'final-class');
    expect(result).toContain('base-class');
    expect(result).toContain('final-class');
  });

  it('should handle empty input', () => {
    const result = cn();
    expect(typeof result).toBe('string');
  });

  it('should handle array of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toContain('class1');
    expect(result).toContain('class2');
    expect(result).toContain('class3');
  });
});
