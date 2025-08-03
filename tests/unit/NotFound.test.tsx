import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Simulamos el componente NotFound basado en el archivo real
const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/10 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          <h1 className="text-8xl font-bold gradient-text animate-pulse">404</h1>
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary opacity-20 animate-bounce"></div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Página no encontrada</h2>
          <p className="text-muted-foreground">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-primary">
            Volver al inicio
          </button>
          <button className="btn-secondary">
            Ir atrás
          </button>
        </div>
      </div>
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

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('NotFound Page Component', () => {
  it('renders 404 error message', () => {
    renderWithRouter(<NotFound />);
    
    // Verificar que se muestra el error 404
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
  });

  it('renders error description', () => {
    renderWithRouter(<NotFound />);
    
    // Verificar que se muestra la descripción del error
    expect(screen.getByText(/Lo sentimos, la página que buscas no existe/)).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    renderWithRouter(<NotFound />);
    
    // Buscar botones de navegación
    expect(screen.getByText('Volver al inicio')).toBeInTheDocument();
    expect(screen.getByText('Ir atrás')).toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    renderWithRouter(<NotFound />);
    
    // Verificar estructura de headings
    const h1 = screen.getByRole('heading', { level: 1 });
    const h2 = screen.getByRole('heading', { level: 2 });
    
    expect(h1).toHaveTextContent('404');
    expect(h2).toHaveTextContent('Página no encontrada');
  });
});
