import { createContext, useContext, useState, useCallback } from 'react'
import { COMPLETION_THRESHOLD } from '../utils/constants'

/**
 * ProgressContext - global in-memory store for video watch progress.
 *
 * Progress is keyed by videoId and stored as:
 *   { watchedSeconds, durationSeconds, percent, completed, lastUpdated }
 *
 * NOTE: In a production app this would be persisted to the backend.
 * For MVP, progress survives navigation within the session only.
 */

const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  // Map of videoId → progress object
  const [progress, setProgress] = useState({})

  // Overall learning stats derived from progress
  const [stats, setStats] = useState({
    totalVideosWatched: 0,
    totalWatchTimeSeconds: 0,
    quizScores: [],       // [{ videoId, score, passedAt }]
    completedPlaylists: [],
  })

  // Update progress for a single video
  const updateVideoProgress = useCallback((videoId, watchedSeconds, durationSeconds) => {
    if (!videoId || !durationSeconds) return

    const percent = Math.min((watchedSeconds / durationSeconds) * 100, 100)
    const completed = percent / 100 >= COMPLETION_THRESHOLD

    setProgress(prev => {
      const wasCompleted = prev[videoId]?.completed || false
      const updated = {
        ...prev,
        [videoId]: {
          watchedSeconds,
          durationSeconds,
          percent,
          completed,
          lastUpdated: new Date().toISOString(),
        },
      }
      // Update stats when a video is newly completed
      if (completed && !wasCompleted) {
        setStats(s => ({
          ...s,
          totalVideosWatched: s.totalVideosWatched + 1,
        }))
      }
      return updated
    })

    // Track total watch time (rolling update)
    setStats(s => ({
      ...s,
      totalWatchTimeSeconds: Math.max(s.totalWatchTimeSeconds, watchedSeconds),
    }))
  }, [])

  // Get progress for a specific video
  const getVideoProgress = useCallback((videoId) => {
    return progress[videoId] || { watchedSeconds: 0, percent: 0, completed: false }
  }, [progress])

  // Save quiz score
  const saveQuizScore = useCallback((videoId, score) => {
    setStats(s => ({
      ...s,
      quizScores: [
        // Keep only the best score per video
        ...s.quizScores.filter(q => q.videoId !== videoId),
        { videoId, score, takenAt: new Date().toISOString() },
      ],
    }))
  }, [])

  // Get quiz score for a video
  const getQuizScore = useCallback((videoId) => {
    return stats.quizScores.find(q => q.videoId === videoId) || null
  }, [stats.quizScores])

  // Calculate playlist completion
  const getPlaylistProgress = useCallback((videoIds) => {
    if (!videoIds?.length) return { completed: 0, total: 0, percent: 0 }
    const completed = videoIds.filter(id => progress[id]?.completed).length
    return {
      completed,
      total: videoIds.length,
      percent: Math.round((completed / videoIds.length) * 100),
    }
  }, [progress])

  const value = {
    progress,
    stats,
    updateVideoProgress,
    getVideoProgress,
    saveQuizScore,
    getQuizScore,
    getPlaylistProgress,
  }

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>')
  return ctx
}
