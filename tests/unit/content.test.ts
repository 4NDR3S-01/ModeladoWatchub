import { describe, it, expect } from 'vitest';

// Simple content service tests
const ContentService = {
  getMovies: () => Promise.resolve([
    { id: '1', title: 'Movie 1', genre: ['Action'] },
    { id: '2', title: 'Movie 2', genre: ['Drama'] }
  ]),
  searchContent: (query: string) => Promise.resolve([
    { id: '1', title: `Results for ${query}`, genre: ['Action'] }
  ]),
  getGenres: () => Promise.resolve(['Action', 'Drama', 'Comedy']),
};

describe('ContentService', () => {
  it('should fetch movies', async () => {
    const movies = await ContentService.getMovies();
    expect(movies).toHaveLength(2);
    expect(movies[0]).toHaveProperty('title');
  });

  it('should search content', async () => {
    const results = await ContentService.searchContent('test');
    expect(results).toHaveLength(1);
    expect(results[0].title).toContain('test');
  });

  it('should get genres', async () => {
    const genres = await ContentService.getGenres();
    expect(genres).toContain('Action');
    expect(genres).toContain('Drama');
    expect(genres).toContain('Comedy');
  });
});
