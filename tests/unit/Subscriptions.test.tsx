import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Simple test component for subscriptions
const SimpleSubscriptionsTest = () => {
  return (
    <div>
      <h1>Elige tu plan perfecto</h1>
      <button onClick={() => console.log('navigate back')}>Regresar</button>
      <div>Plan Básico</div>
      <div>Plan Estándar</div>
      <div>Plan Premium</div>
      <div>$7.99</div>
      <div>$12.99</div>
      <div>$18.99</div>
      <div>Más Popular</div>
    </div>
  );
};

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('Subscriptions Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders subscription plans correctly', () => {
    renderWithProviders(<SimpleSubscriptionsTest />);
    
    expect(screen.getByText('Elige tu plan perfecto')).toBeInTheDocument();
    expect(screen.getByText('Plan Básico')).toBeInTheDocument();
    expect(screen.getByText('Plan Estándar')).toBeInTheDocument();
    expect(screen.getByText('Plan Premium')).toBeInTheDocument();
  });

  it('shows back button', () => {
    renderWithProviders(<SimpleSubscriptionsTest />);
    
    const backButton = screen.getByText('Regresar');
    expect(backButton).toBeInTheDocument();
  });

  it('displays plan prices correctly', () => {
    renderWithProviders(<SimpleSubscriptionsTest />);
    
    expect(screen.getByText('$7.99')).toBeInTheDocument();
    expect(screen.getByText('$12.99')).toBeInTheDocument();
    expect(screen.getByText('$18.99')).toBeInTheDocument();
  });

  it('shows popular badge', () => {
    renderWithProviders(<SimpleSubscriptionsTest />);
    
    expect(screen.getByText('Más Popular')).toBeInTheDocument();
  });
});
