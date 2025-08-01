import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings,
  SkipBack,
  SkipForward,
  Subtitles,
  X,
  ArrowLeft
} from 'lucide-react';
import { StreamingSource } from '@/services/streamingService';
import { cn } from '@/lib/utils';

interface EnhancedVideoPlayerProps {
  source?: StreamingSource;
  title: string;
  episode?: string;
  onClose?: () => void;
  onProgress?: (progress: number) => void;
  startTime?: number;
}

export const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
  source,
  title,
  episode,
  onClose,
  onProgress,
  startTime = 0
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState(source?.quality || 'HD');
  const [showSubtitles, setShowSubtitles] = useState(false);

  const controlsTimeout = useRef<NodeJS.Timeout>();

  // Default video URL for demo
  const videoUrl = source?.url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

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
      if (onProgress) {
        const progress = (video.currentTime / video.duration) * 100;
        onProgress(progress);
      }
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
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const time = (value[0] / 100) * duration;
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0] / 100;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime += seconds;
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div 
        className="relative flex-1 bg-black group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onClick={togglePlay}
          preload="metadata"
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
          </div>
        )}

        {/* Controls Overlay */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onClose && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Volver
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <h2 className="text-white text-xl font-semibold">{title}</h2>
              {episode && <span className="text-white/80">{episode}</span>}
              <Badge variant="secondary" className="bg-black/50 text-white">
                {selectedQuality}
              </Badge>
              {source?.language && (
                <Badge variant="secondary" className="bg-black/50 text-white">
                  {source.language.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>

          {/* Center Play Button */}
          {!isPlaying && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                variant="ghost"
                size="lg"
                onClick={togglePlay}
                className="bg-black/50 hover:bg-black/70 text-white w-20 h-20 rounded-full"
              >
                <Play className="w-8 h-8 ml-1" />
              </Button>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <Slider
                value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
                onValueChange={handleSeek}
                className="w-full"
                step={0.1}
              />
              <div className="flex justify-between text-sm text-white/80">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skip(-10)}
                  className="text-white hover:bg-white/20"
                >
                  <SkipBack className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skip(10)}
                  className="text-white hover:bg-white/20"
                >
                  <SkipForward className="w-5 h-5" />
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>

                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={handleVolumeChange}
                    className="w-20"
                    step={1}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {source?.subtitles && source.subtitles.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSubtitles(!showSubtitles)}
                    className="text-white hover:bg-white/20"
                  >
                    <Subtitles className="w-5 h-5" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute right-4 bottom-20 bg-black/90 rounded-lg p-4 text-white min-w-48">
            <h3 className="font-semibold mb-3">Configuración</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-white/80">Calidad</label>
                <select 
                  value={selectedQuality}
                  onChange={(e) => setSelectedQuality(e.target.value as any)}
                  className="w-full bg-white/10 rounded px-2 py-1 mt-1"
                >
                  <option value="4K">4K Ultra HD</option>
                  <option value="HD">HD 1080p</option>
                  <option value="SD">SD 720p</option>
                </select>
              </div>
              
              {source?.subtitles && source.subtitles.length > 0 && (
                <div>
                  <label className="text-sm text-white/80">Subtítulos</label>
                  <select className="w-full bg-white/10 rounded px-2 py-1 mt-1">
                    <option value="">Sin subtítulos</option>
                    {source.subtitles.map(lang => (
                      <option key={lang} value={lang}>
                        {lang.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
