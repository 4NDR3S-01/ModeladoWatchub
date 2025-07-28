import { describe, it, expect } from 'vitest';

// Simple utility function tests
const utils = {
  formatPrice: (price: number) => `$${price.toFixed(2)}`,
  formatDuration: (minutes: number) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`,
  isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
};

describe('Utility Functions', () => {
  describe('formatPrice', () => {
    it('should format price correctly', () => {
      expect(utils.formatPrice(9.99)).toBe('$9.99');
      expect(utils.formatPrice(0)).toBe('$0.00');
      expect(utils.formatPrice(100)).toBe('$100.00');
    });
  });

  describe('formatDuration', () => {
    it('should format duration correctly', () => {
      expect(utils.formatDuration(90)).toBe('1h 30m');
      expect(utils.formatDuration(45)).toBe('0h 45m');
      expect(utils.formatDuration(120)).toBe('2h 0m');
    });
  });

  describe('isValidEmail', () => {
    it('should validate email correctly', () => {
      expect(utils.isValidEmail('test@example.com')).toBe(true);
      expect(utils.isValidEmail('invalid-email')).toBe(false);
      expect(utils.isValidEmail('test@')).toBe(false);
    });
  });
});
