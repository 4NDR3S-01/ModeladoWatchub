// Service to handle streaming URLs and video sources
export interface StreamingSource {
  id: string;
  name: string;
  url: string;
  quality: 'HD' | '4K' | 'SD';
  language: string;
  subtitles?: string[];
}

export interface VideoPlayer {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

class StreamingService {
  // Popular free streaming sources for demo purposes
  private demoStreamingSources: Record<string, StreamingSource[]> = {
    // Action Movies
    'tt0468569': [ // The Dark Knight
      {
        id: '1',
        name: 'Demo Stream',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        quality: 'HD',
        language: 'en',
        subtitles: ['es', 'en']
      }
    ],
    'tt0111161': [ // The Shawshank Redemption
      {
        id: '2',
        name: 'Demo Stream',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        quality: 'HD',
        language: 'en',
        subtitles: ['es', 'en']
      }
    ],
    'tt0137523': [ // Fight Club
      {
        id: '3',
        name: 'Demo Stream',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        quality: 'HD',
        language: 'en',
        subtitles: ['es', 'en']
      }
    ]
  };

  async getStreamingSources(imdbId: string): Promise<StreamingSource[]> {
    // In a real app, this would check multiple streaming services
    // For demo purposes, we'll return demo sources
    return this.demoStreamingSources[imdbId] || [
      {
        id: 'demo',
        name: 'Demo Stream',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        quality: 'HD',
        language: 'en',
        subtitles: ['es', 'en']
      }
    ];
  }

  async getTrailerUrl(imdbId: string): Promise<string | null> {
    // In a real app, this would fetch from YouTube API or similar
    // For demo, return a sample trailer
    const trailers: Record<string, string> = {
      'tt0468569': 'https://www.youtube.com/watch?v=EXeTwQWrcwY', // The Dark Knight
      'tt0111161': 'https://www.youtube.com/watch?v=6hB3S9bIaco', // Shawshank
      'tt0137523': 'https://www.youtube.com/watch?v=qtRKdVHc-cE'  // Fight Club
    };

    return trailers[imdbId] || null;
  }

  // Check if a movie is available for streaming
  async isStreamingAvailable(imdbId: string): Promise<boolean> {
    const sources = await this.getStreamingSources(imdbId);
    return sources.length > 0;
  }

  // Get the best quality source available
  async getBestQualitySource(imdbId: string): Promise<StreamingSource | null> {
    const sources = await this.getStreamingSources(imdbId);
    if (sources.length === 0) return null;

    // Priority: 4K > HD > SD
    const priorityOrder = ['4K', 'HD', 'SD'];
    for (const quality of priorityOrder) {
      const source = sources.find(s => s.quality === quality);
      if (source) return source;
    }

    return sources[0];
  }

  // Popular streaming platforms integration points
  async checkNetflixAvailability(imdbId: string): Promise<boolean> {
    // This would integrate with Netflix API in a real app
    return Math.random() > 0.7; // Random for demo
  }

  async checkAmazonPrimeAvailability(imdbId: string): Promise<boolean> {
    // This would integrate with Amazon Prime API in a real app
    return Math.random() > 0.6; // Random for demo
  }

  async checkDisneyPlusAvailability(imdbId: string): Promise<boolean> {
    // This would integrate with Disney+ API in a real app
    return Math.random() > 0.8; // Random for demo
  }

  // Get streaming platforms where movie is available
  async getAvailablePlatforms(imdbId: string): Promise<string[]> {
    const platforms: string[] = [];

    if (await this.checkNetflixAvailability(imdbId)) {
      platforms.push('Netflix');
    }
    if (await this.checkAmazonPrimeAvailability(imdbId)) {
      platforms.push('Amazon Prime');
    }
    if (await this.checkDisneyPlusAvailability(imdbId)) {
      platforms.push('Disney+');
    }

    return platforms;
  }

  // Generate video player configuration
  getPlayerConfig(source: StreamingSource) {
    return {
      src: source.url,
      type: 'video/mp4',
      quality: source.quality,
      language: source.language,
      subtitles: source.subtitles?.map(lang => ({
        language: lang,
        url: `/subtitles/${source.id}_${lang}.vtt`
      })) || [],
      controls: true,
      autoplay: false,
      preload: 'metadata'
    };
  }
}

export const streamingService = new StreamingService();
