import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface VideoProgress {
  currentTime: number;
  duration: number;
  lastWatched: string;
  completed: boolean;
}

interface VideoProgressMap {
  [videoId: string]: VideoProgress;
}

export const useVideoProgress = (videoId: string) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<VideoProgress | null>(null);

  // Create a unique key for this user and video
  const getStorageKey = useCallback(() => {
    const userId = user?.id || 'guest';
    return `video_progress_${userId}_${videoId}`;
  }, [user?.id, videoId]);

  // Load progress from localStorage
  const loadProgress = useCallback(() => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        const parsedProgress = JSON.parse(stored) as VideoProgress;
        setProgress(parsedProgress);
        return parsedProgress;
      }
    } catch (error) {
      console.error('Error loading video progress:', error);
    }
    return null;
  }, [getStorageKey]);

  // Save progress to localStorage
  const saveProgress = useCallback((currentTime: number, duration: number) => {
    if (!videoId || duration === 0) return;

    const progressData: VideoProgress = {
      currentTime,
      duration,
      lastWatched: new Date().toISOString(),
      completed: currentTime >= duration * 0.9 // Mark as completed if watched 90% or more
    };

    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(progressData));
      setProgress(progressData);
    } catch (error) {
      console.error('Error saving video progress:', error);
    }
  }, [getStorageKey, videoId]);

  // Clear progress (when video is completed or user wants to restart)
  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(getStorageKey());
      setProgress(null);
    } catch (error) {
      console.error('Error clearing video progress:', error);
    }
  }, [getStorageKey]);

  // Get progress percentage
  const getProgressPercentage = useCallback(() => {
    if (!progress || progress.duration === 0) return 0;
    return Math.min((progress.currentTime / progress.duration) * 100, 100);
  }, [progress]);

  // Check if video should be resumed
  const shouldResume = useCallback(() => {
    if (!progress) return false;
    // Resume if there's progress and it's not completed and more than 30 seconds watched
    return progress.currentTime > 30 && !progress.completed;
  }, [progress]);

  // Get all video progress for the current user (for continue watching section)
  const getAllProgress = useCallback((): VideoProgressMap => {
    try {
      const userId = user?.id || 'guest';
      const allProgress: VideoProgressMap = {};
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`video_progress_${userId}_`)) {
          const videoId = key.replace(`video_progress_${userId}_`, '');
          const stored = localStorage.getItem(key);
          if (stored) {
            allProgress[videoId] = JSON.parse(stored);
          }
        }
      }
      
      return allProgress;
    } catch (error) {
      console.error('Error getting all progress:', error);
      return {};
    }
  }, [user?.id]);

  // Load progress on mount
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return {
    progress,
    saveProgress,
    clearProgress,
    loadProgress,
    getProgressPercentage,
    shouldResume,
    getAllProgress
  };
};
