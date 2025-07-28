import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface VideoPlayerProps {
  title: string;
  episode?: string;
  onClose: () => void;
}

export function VideoPlayer({ title, episode, onClose }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("45:32");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls, isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Video container */}
      <div 
        className="relative flex-1 bg-black cursor-none group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Mock video background */}
        <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center text-white/60">
            <Play className="w-24 h-24 mx-auto mb-4" />
            <p className="text-lg">Reproduciendo: {title}</p>
            {episode && <p className="text-sm">{episode}</p>}
          </div>
        </div>

        {/* Top bar */}
        <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-6 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              ← Volver
            </Button>
            <div className="text-white text-right">
              <h1 className="text-xl font-semibold">{title}</h1>
              {episode && <p className="text-sm text-white/80">{episode}</p>}
            </div>
          </div>
        </div>

        {/* Center play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="lg"
            onClick={togglePlay}
            className="rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/30 w-20 h-20"
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
          </Button>
        </div>

        {/* Bottom controls */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          {/* Progress bar */}
          <div className="mb-4">
            <Progress value={progress} className="h-1 bg-white/20" />
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="ghost"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <SkipBack className="w-5 h-5" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="w-5 h-5" />
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-white rounded-full" />
                </div>
              </div>

              <div className="text-white text-sm">
                {currentTime} / {duration}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <Settings className="w-5 h-5" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}