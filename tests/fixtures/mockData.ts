// Datos de prueba para movies
export const mockMovies = [
  {
    id: '1',
    title: 'Película de Prueba 1',
    description: 'Una película de prueba para testing',
    genre: ['Acción', 'Aventura'],
    release_year: 2023,
    rating: 8.5,
    poster_url: 'https://example.com/poster1.jpg',
    video_url: 'https://example.com/video1.mp4',
    duration: 120,
    content_type: 'movie' as const,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Serie de Prueba 1',
    description: 'Una serie de prueba para testing',
    genre: ['Drama', 'Suspense'],
    release_year: 2022,
    rating: 9.0,
    poster_url: 'https://example.com/poster2.jpg',
    video_url: 'https://example.com/video2.mp4',
    duration: 45,
    content_type: 'series' as const,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }
];

// Datos de prueba para usuarios
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    display_name: 'Usuario de Prueba'
  },
  app_metadata: {}
};

// Datos de prueba para perfiles
export const mockProfile = {
  id: 'test-profile-id',
  user_id: 'test-user-id',
  display_name: 'Usuario de Prueba',
  avatar_url: 'https://example.com/avatar.jpg',
  subscription_plan: 'basic',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
};

// Datos de prueba para suscripciones
export const mockSubscription = {
  id: 'test-subscription-id',
  user_id: 'test-user-id',
  plan: 'basic' as const,
  status: 'active' as const,
  stripe_customer_id: 'cus_test123',
  current_period_start: '2023-01-01T00:00:00Z',
  current_period_end: '2023-02-01T00:00:00Z',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
};
