// Utilidades para testing
import React, { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Wrapper para componentes que usan React Router
export const RouterWrapper = ({ children }: { children: ReactElement }) => {
  return React.createElement(BrowserRouter, null, children);
};

// Función para simular delay en tests
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helpers para testing de formularios
export const fillForm = (form: HTMLFormElement, data: Record<string, string>) => {
  Object.entries(data).forEach(([name, value]) => {
    const input = form.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
};

// Mock para window.matchMedia (necesario para algunos componentes)
export const mockMatchMedia = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Helper para limpiar mocks
export const clearAllMocks = () => {
  vi.clearAllMocks();
};

// Función para esperar a que un elemento aparezca
export const waitForElement = async (
  getByTestId: (id: string) => HTMLElement,
  testId: string,
  timeout = 1000
) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      return getByTestId(testId);
    } catch {
      await delay(50);
    }
  }
  throw new Error(`Element with test-id "${testId}" not found within ${timeout}ms`);
};
