import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock de la función cn para testing
const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Test del utility function
describe('Utils Library', () => {
  it('should merge class names correctly', () => {
    const result = cn('base-class', 'additional-class');
    expect(result).toBe('base-class additional-class');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isHidden = false;
    const result = cn('base-class', isActive && 'conditional-class', isHidden && 'hidden-class');
    expect(result).toBe('base-class conditional-class');
  });

  it('should handle undefined and null values', () => {
    const result = cn('base-class', undefined, null, 'final-class');
    expect(result).toBe('base-class final-class');
  });

  it('should handle empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });
});

// Componente simple para testing
interface TestButtonProps {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

const TestButton = ({ className, children, ...props }: TestButtonProps) => {
  return (
    <button className={cn('btn-base', className)} {...props}>
      {children}
    </button>
  );
};

describe('TestButton Component', () => {
  it('renders button with correct classes', () => {
    render(<TestButton className="btn-primary">Click me</TestButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-base');
    expect(button).toHaveClass('btn-primary');
    expect(button).toHaveTextContent('Click me');
  });

  it('renders button without additional classes', () => {
    render(<TestButton>Default button</TestButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-base');
    expect(button).toHaveTextContent('Default button');
  });
});
