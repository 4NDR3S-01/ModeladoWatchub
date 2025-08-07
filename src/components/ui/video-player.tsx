import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  SkipBack,
  SkipForward,
  Settings,
  Maximize,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { StreamingSource } from '@/services/streamingService';
// Formats seconds as mm:ss or hh:mm:ss
function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

interface VideoPlayerProps {
  source?: StreamingSource;
  title: string;
  episode?: string;
  onClose?: () => void;
  onProgress?: (progress: number) => void;
  startTime?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  source,
  title,
  episode,
  onClose,
  onProgress,
  startTime = 0
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mouseCursor, setMouseCursor] = useState('cursor-pointer');

  // Default video URL for demo
  const videoUrl = source?.url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  // Auto-hide controls logic with proper cleanup
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
    
    // Only hide controls when playing and after timeout
    if (isPlaying && showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setMouseCursor('cursor-none');
      }, 4000); // 4 seconds - más tiempo para mejor UX
    }
  };

  useEffect(() => {
    // Always show controls initially and when paused
    if (!isPlaying) {
      setShowControls(true);
      setMouseCursor('cursor-pointer');
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      return;
    }

    resetControlsTimeout();

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = null;
      }
    };
  }, [showControls, isPlaying]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      if (startTime > 0) {
        video.currentTime = startTime;
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onProgress?.(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [startTime, onProgress]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current && duration > 0) {
      const time = (value[0] / 100) * duration;
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && videoRef.current) {
      videoRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    setMouseCursor('cursor-pointer');
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    // Hide controls after 3 seconds of inactivity (only if playing)
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setMouseCursor('cursor-none');
      }, 3000); // Reducido de 4 a 3 segundos
    }
  }, [isPlaying]);

  const handleMouseEnterControls = useCallback(() => {
    // Always keep controls visible when hovering over them
    setShowControls(true);
    setMouseCursor('cursor-pointer');
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  }, []);

  const handleMouseLeaveControls = useCallback(() => {
    // Start hiding controls when leaving control area (only if playing)
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setMouseCursor('cursor-none');
      }, 2000);
    }
  }, [isPlaying]);

  const handleVideoClick = (e: React.MouseEvent) => {
    // Prevent click when interacting with controls
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.controls-area')) {
      return;
    }
    
    setShowControls(true);
    togglePlay();
  };

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Video container */}
      <section 
        className={`relative flex-1 bg-black group ${mouseCursor} min-h-0`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => {
          setShowControls(true);
          setMouseCursor('cursor-pointer');
        }}
        onMouseLeave={() => {
          // Solo ocultar si está reproduciéndose
          if (isPlaying) {
            setTimeout(() => {
              setShowControls(false);
              setMouseCursor('cursor-none');
            }, 2000);
          }
        }} 
        aria-label="Video player controls"
      >
        {/* Real video element for demo - Responsive */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain max-h-full"
          src={videoUrl}
          onClick={handleVideoClick}
          preload="metadata"
          muted={isMuted}
          style={{
            maxWidth: '100vw',
            maxHeight: '100vh'
          }}
        >
          {source?.subtitles?.map((subtitle, index) => (
            <track
              key={index}
              kind="captions"
              src={`/subtitles/${subtitle}.vtt`}
              srcLang={subtitle}
              label={subtitle.toUpperCase()}
              default={index === 0}
            />
          ))}
          <track
            kind="captions"
            src=""
            srcLang="es"
            label="Español"
            default
          />
        </video>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center text-white">
              <Loader2 className="animate-spin w-12 h-12 mx-auto mb-4" />
              <p className="text-lg">Cargando: {title}</p>
              {episode && <p className="text-sm text-white/80">{episode}</p>}
            </div>
          </div>
        )}

        {/* Fallback when no video available */}
        {!videoUrl && (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center text-white/60">
              <Play className="w-24 h-24 mx-auto mb-4" />
              <p className="text-lg">Reproduciendo: {title}</p>
              {episode && <p className="text-sm">{episode}</p>}
              <p className="text-sm text-white/40 mt-2">Video de demostración</p>
            </div>
          </div>
        )}

        {/* Top bar */}
        <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/95 via-black/70 to-transparent p-4 sm:p-6 transition-opacity duration-300 z-20 ${(showControls || !isPlaying) ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 sm:p-3"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="text-sm sm:text-base">Volver</span>
            </Button>
            <div className="text-white text-right">
              <h1 className="text-lg sm:text-xl font-semibold truncate max-w-xs sm:max-w-md">{title}</h1>
              {episode && <p className="text-xs sm:text-sm text-white/80 truncate">{episode}</p>}
            </div>
          </div>
        </div>

        {/* Center play button - only show when paused and not loading */}
        {!isPlaying && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <Button
              size="lg"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
                setShowControls(true);
              }}
              className="rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/30 w-16 h-16 sm:w-20 sm:h-20 transition-all duration-200 pointer-events-auto"
            >
              <Play className="w-6 h-6 sm:w-8 sm:h-8 ml-1" />
            </Button>
          </div>
        )}

        {/* Bottom controls - Always visible for 2 seconds, then fade based on mouse movement */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 sm:p-6 transition-opacity duration-300 pointer-events-auto z-20 ${(showControls || !isPlaying) ? 'opacity-100' : 'opacity-0'}`}
          onMouseEnter={handleMouseEnterControls}
          onMouseLeave={handleMouseLeaveControls}
          style={{ 
            minHeight: '120px',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          {/* Progress bar */}
          <div className="mb-3 sm:mb-4 space-y-2">
            <Slider
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full cursor-pointer h-2"
              onValueCommit={() => setShowControls(true)}
            />
            <div className="flex justify-between text-xs sm:text-sm text-white/90 font-medium">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  togglePlay();
                  setShowControls(true);
                }}
                className="text-white hover:bg-white/20 transition-colors p-2 sm:p-3"
              >
                {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={skipBackward}
                className="text-white hover:bg-white/20 transition-colors p-2 sm:p-3"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={skipForward}
                className="text-white hover:bg-white/20 transition-colors p-2 sm:p-3"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>

              <div className="flex items-center gap-2 ml-1 sm:ml-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20 transition-colors p-2 sm:p-3"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                </Button>
                <div className="hidden sm:block">
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    className="w-16 sm:w-20 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20 transition-colors p-2 sm:p-3"
              >
                <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};