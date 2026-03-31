import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { socialAPI, videosAPI } from '../utils/api'
import { formatNumericDate, formatRelativeTime, formatViewCount, getInitials } from '../utils/formatters'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import VideoCard from '../components/common/VideoCard'
import styles from './Watch.module.css'

function cleanTitle(title) {
  if (!title) return ''
  return title.replace(/^[^:]+:\s*/, '')
}

const EXPLORE_MORE_VIEW_COUNTS = [132, 187, 241, 316, 402, 489]

function buildCommentTree(comments) {
  const byId = new Map()
  const roots = []

  comments.forEach(comment => {
    byId.set(comment.id, { ...comment, replies: [] })
  })

  comments.forEach(comment => {
    const node = byId.get(comment.id)
    if (comment.parent_id && byId.has(comment.parent_id)) {
      byId.get(comment.parent_id).replies.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

function CommentItem({
  comment,
  isAuthenticated,
  replyingTo,
  replyDrafts,
  submittingCommentId,
  onReplyStart,
  onReplyCancel,
  onReplyChange,
  onReplySubmit,
}) {
  return (
    <article className={styles.commentItem}>
      <div className={styles.commentAvatar}>{getInitials(comment.username || 'User')}</div>

      <div className={styles.commentBody}>
        <div className={styles.commentCard}>
          <div className={styles.commentHeader}>
            <span className={styles.commentAuthor}>{comment.username || `User #${comment.user_id}`}</span>
            <span className={styles.commentTime}>{formatRelativeTime(comment.created_at)}</span>
          </div>
          <p className={styles.commentText}>{comment.content}</p>
        </div>

        {isAuthenticated && (
          <div className={styles.commentActions}>
            <button
              type="button"
              className={styles.replyButton}
              onClick={() => onReplyStart(comment.id)}
            >
              Reply
            </button>
          </div>
        )}

        {replyingTo === comment.id && (
          <form className={styles.replyComposer} onSubmit={(event) => onReplySubmit(event, comment.id)}>
            <textarea
              className={styles.replyInput}
              value={replyDrafts[comment.id] || ''}
              onChange={(event) => onReplyChange(comment.id, event.target.value)}
              placeholder={`Reply to ${comment.username || 'this comment'}...`}
              rows={3}
            />
            <div className={styles.replyComposerActions}>
              <button type="button" className={styles.replyCancelButton} onClick={onReplyCancel}>
                Cancel
              </button>
              <button
                type="submit"
                className={styles.replySubmitButton}
                disabled={submittingCommentId === comment.id || !(replyDrafts[comment.id] || '').trim()}
              >
                {submittingCommentId === comment.id ? 'Replying...' : 'Post Reply'}
              </button>
            </div>
          </form>
        )}

        {comment.replies.length > 0 && (
          <div className={styles.replyList}>
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isAuthenticated={isAuthenticated}
                replyingTo={replyingTo}
                replyDrafts={replyDrafts}
                submittingCommentId={submittingCommentId}
                onReplyStart={onReplyStart}
                onReplyCancel={onReplyCancel}
                onReplyChange={onReplyChange}
                onReplySubmit={onReplySubmit}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

export default function Watch() {
  const { videoId } = useParams()
  const { isAuthenticated } = useAuth()
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [recommendedVideos, setRecommendedVideos] = useState([])
  const [showSettings, setShowSettings] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [savedToPlaylist, setSavedToPlaylist] = useState(false)
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentsError, setCommentsError] = useState('')
  const [commentDraft, setCommentDraft] = useState('')
  const [replyDrafts, setReplyDrafts] = useState({})
  const [replyingTo, setReplyingTo] = useState(null)
  const [submittingCommentId, setSubmittingCommentId] = useState(null)
  const exploreMoreVideos = recommendedVideos.slice(0, 6)
  const commentTree = useMemo(() => buildCommentTree(comments), [comments])

  const videoRef = useRef(null)
  const settingsRef = useRef(null)
  const settingsButtonRef = useRef(null)
  const playerWrapperRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      const clickedInsidePopup = settingsRef.current?.contains(event.target)
      const clickedSettingsButton = settingsButtonRef.current?.contains(event.target)

      if (!clickedInsidePopup && !clickedSettingsButton) {
        setShowSettings(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    async function fetchVideoData() {
      setLoading(true)
      setError(null)

      try {
        const [data, feed] = await Promise.all([
          videosAPI.getById(videoId),
          videosAPI.getFeed(1, 10),
        ])

        setVideo({
          ...data,
          author_name: data.author_name || 'HowToob Official',
          author_avatar: data.author_avatar || '/videos/files/thumbnails/howtoob_logo.png',
        })

        setRecommendedVideos((feed.results || []).filter(item => item.id !== Number(videoId)))
      } catch (err) {
        setError(err.message || 'Failed to load video')
      } finally {
        setLoading(false)
      }
    }

    fetchVideoData()
  }, [videoId])

  useEffect(() => {
    async function fetchComments() {
      setCommentsLoading(true)
      setCommentsError('')

      try {
        const data = await socialAPI.getComments(videoId)
        setComments(Array.isArray(data) ? data : [])
      } catch (err) {
        setComments([])
        setCommentsError(err.message || 'Failed to load comments')
      } finally {
        setCommentsLoading(false)
      }
    }

    fetchComments()
  }, [videoId])

  useEffect(() => {
    const handleFsChange = () => {
      const fullscreenActive = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      )
      setShowSettings(false)
      setIsPlaying(videoRef.current ? !videoRef.current.paused : false)
      if (!fullscreenActive) {
        playerWrapperRef.current?.focus?.()
      }
    }

    document.addEventListener('fullscreenchange', handleFsChange)
    document.addEventListener('webkitfullscreenchange', handleFsChange)
    document.addEventListener('mozfullscreenchange', handleFsChange)
    document.addEventListener('MSFullscreenChange', handleFsChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange)
      document.removeEventListener('webkitfullscreenchange', handleFsChange)
      document.removeEventListener('mozfullscreenchange', handleFsChange)
      document.removeEventListener('MSFullscreenChange', handleFsChange)
    }
  }, [])

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed)
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
  }

  const togglePlay = () => {
    if (!videoRef.current) return

    if (isPlaying) videoRef.current.pause()
    else videoRef.current.play()

    setIsPlaying(!isPlaying)
  }

  const handleVolumeChange = (event) => {
    const value = parseFloat(event.target.value)
    setVolume(value)

    if (videoRef.current) {
      videoRef.current.volume = value
      videoRef.current.muted = value === 0
      setIsMuted(value === 0)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return

    const muted = !isMuted
    setIsMuted(muted)
    videoRef.current.muted = muted

    if (muted) videoRef.current.volume = 0
    else videoRef.current.volume = volume || 0.5
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (event) => {
    const value = parseFloat(event.target.value)
    setCurrentTime(value)

    if (videoRef.current) {
      videoRef.current.currentTime = value
    }
  }

  const toggleFullscreen = () => {
    const element = playerWrapperRef.current
    if (!element) return

    const fullscreenActive = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    )

    if (!fullscreenActive) {
      const fullscreenOptions = { navigationUI: 'hide' }
      if (element.requestFullscreen) {
        element.requestFullscreen(fullscreenOptions).catch(err => console.error('Fullscreen error:', err))
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen()
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen()
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen()
      }
      return
    }

    if (document.exitFullscreen) {
      document.exitFullscreen().catch(err => console.error('Exit fullscreen error:', err))
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
  }

  const togglePictureInPicture = async () => {
    try {
      if (videoRef.current !== document.pictureInPictureElement) {
        await videoRef.current.requestPictureInPicture()
      } else {
        await document.exitPictureInPicture()
      }
      setShowSettings(false)
    } catch (err) {
      console.error('Picture-in-picture failed', err)
    }
  }

  const handleReplyChange = (commentId, value) => {
    setReplyDrafts(prev => ({ ...prev, [commentId]: value }))
  }

  const handleReplyStart = (commentId) => {
    setReplyingTo(commentId)
  }

  const handleReplyCancel = () => {
    setReplyingTo(null)
  }

  const handleCommentSubmit = async (event) => {
    event.preventDefault()
    const content = commentDraft.trim()
    if (!content) return

    setSubmittingCommentId('new')
    try {
      const created = await socialAPI.addComment(videoId, content)
      setComments(prev => [...prev, created])
      setCommentDraft('')
      setCommentsError('')
    } catch (err) {
      setCommentsError(err.message || 'Failed to post comment')
    } finally {
      setSubmittingCommentId(null)
    }
  }

  const handleReplySubmit = async (event, parentId) => {
    event.preventDefault()
    const content = (replyDrafts[parentId] || '').trim()
    if (!content) return

    setSubmittingCommentId(parentId)
    try {
      const created = await socialAPI.addComment(videoId, content, parentId)
      setComments(prev => [...prev, created])
      setReplyDrafts(prev => ({ ...prev, [parentId]: '' }))
      setReplyingTo(null)
      setCommentsError('')
    } catch (err) {
      setCommentsError(err.message || 'Failed to post reply')
    } finally {
      setSubmittingCommentId(null)
    }
  }

  const handleLikeToggle = () => {
    setLiked(prev => {
      const next = !prev
      if (next) setDisliked(false)
      return next
    })
  }

  const handleDislikeToggle = () => {
    setDisliked(prev => {
      const next = !prev
      if (next) setLiked(false)
      return next
    })
  }

  const handleSaveToggle = () => {
    setSavedToPlaylist(prev => !prev)
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className={styles.watchPage}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <LoadingSpinner size="lg" label="Loading video..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.watchPage}>
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  if (!video) return null

  return (
    <div className={styles.watchPage}>
      <div className={styles.mainLayout}>
        <div className={styles.videoSection}>
          <div className={styles.playerWrapper} ref={playerWrapperRef}>
            <video
              ref={videoRef}
              className={styles.videoElement}
              src={video.video_url}
              poster={video.thumbnail_url}
              autoPlay
              onPlay={() => {
                setIsPlaying(true)
                if (videoRef.current) videoRef.current.playbackRate = playbackSpeed
              }}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={togglePlay}
              onDoubleClick={toggleFullscreen}
            />

            <div className={styles.customControlBar}>
              <div className={styles.progressBarContainer}>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className={styles.progressBar}
                  style={{ '--progress': `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>

              <div className={styles.controlsRow}>
                <div className={styles.leftControls}>
                  <button onClick={togglePlay} className={styles.iconBtn} title={isPlaying ? 'Pause' : 'Play'}>
                    {isPlaying ? (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    )}
                  </button>

                  <div className={styles.volumeGroup}>
                    <button onClick={toggleMute} className={styles.iconBtn}>
                      {isMuted || volume === 0 ? (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 5L6 9H2v6h4l5 4V5z" />
                          <line x1="23" y1="9" x2="17" y2="15" />
                          <line x1="17" y1="9" x2="23" y2="15" />
                        </svg>
                      ) : (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 5L6 9H2v6h4l5 4V5z" />
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                        </svg>
                      )}
                    </button>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className={styles.volumeSlider}
                      style={{ '--volume-progress': `${(isMuted ? 0 : volume) * 100}%` }}
                    />
                  </div>

                  <div className={styles.timeDisplay}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                <div className={styles.rightControls}>
                  <button
                    ref={settingsButtonRef}
                    className={`${styles.iconBtn} ${showSettings ? styles.iconBtnActive : ''}`}
                    onClick={() => setShowSettings(prev => !prev)}
                    title="Settings"
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  </button>

                  <button onClick={toggleFullscreen} className={styles.iconBtn} title="Fullscreen">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                  </button>

                  {showSettings && (
                    <div className={styles.settingsPopup} ref={settingsRef}>
                      <div className={styles.settingsHeader}>Playback settings</div>

                      <div className={styles.settingItem}>
                        <div className={styles.settingLabel}>
                          <span>Playback speed</span>
                          <span className={styles.speedValue}>{playbackSpeed}x</span>
                        </div>
                        <div className={styles.sliderContainer}>
                          <button className={styles.adjustBtn} onClick={() => handleSpeedChange(Math.max(0.25, playbackSpeed - 0.05))}>-</button>
                          <input
                            type="range"
                            min="0.25"
                            max="2"
                            step="0.05"
                            value={playbackSpeed}
                            onChange={(event) => handleSpeedChange(parseFloat(event.target.value))}
                            className={styles.speedSlider}
                          />
                          <button className={styles.adjustBtn} onClick={() => handleSpeedChange(Math.min(2, playbackSpeed + 0.05))}>+</button>
                        </div>
                        <div className={styles.speedPresets}>
                          {[1, 1.25, 1.5, 2].map(speed => (
                            <button
                              key={speed}
                              onClick={() => handleSpeedChange(speed)}
                              className={`${styles.presetBtn} ${playbackSpeed === speed ? styles.presetBtnActive : ''}`}
                            >
                              {speed === 1 ? 'Normal' : `${speed}x`}
                            </button>
                          ))}
                        </div>
                      </div>

                      <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1rem 0' }} />

                      <div className={styles.settingItem}>
                        <button className={styles.settingsActionBtn} onClick={togglePictureInPicture}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <rect x="13" y="13" width="7" height="7" rx="1" />
                          </svg>
                          <span>Picture-in-Picture</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.videoInfoArea}>
            <div className={styles.titleRow}>
              <h1 className={styles.videoTitle}>{video.title}</h1>
              <div className={styles.authorContainer}>
                <div className={styles.authorText}>
                  <span className={styles.authorName}>{video.author_name}</span>
                  <div className={styles.videoMeta}>
                    <span>{formatViewCount(video.views)} views</span>
                    <span className={styles.dotSeparator}>•</span>
                    <span>{formatNumericDate(video.created_at)}</span>
                  </div>
                </div>
                <div className={styles.authorAvatar}>
                  <img src={video.author_avatar} alt={video.author_name} />
                </div>
              </div>
            </div>

            <div className={styles.actionRow}>
              <div className={styles.engagementActions}>
                <button
                  type="button"
                  className={`${styles.actionChip} ${liked ? styles.actionChipActive : ''}`}
                  onClick={handleLikeToggle}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 10v12" />
                    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.97 2.35l-1 7A2 2 0 0 1 18.82 21H6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h3.76a2 2 0 0 0 1.94-1.53L13 2a2 2 0 0 1 2 2.44Z" />
                  </svg>
                  <span>Like</span>
                </button>

                <button
                  type="button"
                  className={`${styles.actionChip} ${disliked ? styles.actionChipActive : ''}`}
                  onClick={handleDislikeToggle}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 14V2" />
                    <path d="M9 18.12 10 14H4.17A2 2 0 0 1 2.2 11.65l1-7A2 2 0 0 1 5.18 3H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-3.76a2 2 0 0 0-1.94 1.53L11 22a2 2 0 0 1-2-2.44Z" />
                  </svg>
                  <span>Dislike</span>
                </button>

                <button
                  type="button"
                  className={`${styles.actionChip} ${savedToPlaylist ? styles.actionChipActive : ''}`}
                  onClick={handleSaveToggle}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>{savedToPlaylist ? 'Saved' : 'Save to Playlist'}</span>
                </button>
              </div>

              <div className={styles.actionContainer}>
                <button
                  type="button"
                  aria-disabled="true"
                  onClick={(event) => event.preventDefault()}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className={`${styles.quizButton} ${styles.quizButtonDisabled}`}
                >
                  Take Quiz
                </button>
                {showTooltip && (
                  <div className={styles.tooltip}>
                    Coming Soon! This feature is in development.
                  </div>
                )}
              </div>
            </div>

            <p className={styles.videoDesc}>{video.description}</p>
          </div>

          <section className={styles.commentsSection}>
            <div className={styles.commentsHeader}>
              <h3 className={styles.commentsTitle}>Comments</h3>
              <span className={styles.commentsCount}>{comments.length}</span>
            </div>

            {isAuthenticated ? (
              <form className={styles.commentComposer} onSubmit={handleCommentSubmit}>
                <textarea
                  className={styles.commentInput}
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  placeholder="Share your thoughts about this tutorial..."
                  rows={4}
                />
                <div className={styles.commentComposerActions}>
                  <span className={styles.commentHint}>Replies are allowed!</span>
                  <button
                    type="submit"
                    className={styles.commentSubmitButton}
                    disabled={submittingCommentId === 'new' || !commentDraft.trim()}
                  >
                    {submittingCommentId === 'new' ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.commentsNotice}>
                Sign in to leave a comment or reply to the discussion.
              </div>
            )}

            {commentsError && <p className={styles.commentsError}>{commentsError}</p>}

            {commentsLoading ? (
              <div className={styles.commentsLoading}>Loading comments...</div>
            ) : commentTree.length > 0 ? (
              <div className={styles.commentList}>
                {commentTree.map(comment => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    isAuthenticated={isAuthenticated}
                    replyingTo={replyingTo}
                    replyDrafts={replyDrafts}
                    submittingCommentId={submittingCommentId}
                    onReplyStart={handleReplyStart}
                    onReplyCancel={handleReplyCancel}
                    onReplyChange={handleReplyChange}
                    onReplySubmit={handleReplySubmit}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.commentsEmpty}>
                No comments yet. Start the conversation.
              </div>
            )}
          </section>

          <div className={styles.recommendedSection}>
            <h3 className={styles.recommendedTitle}>Explore More</h3>
            <div className={styles.videoGrid}>
              {exploreMoreVideos.map(item => (
                <VideoCard
                  key={item.id}
                  video={{
                    ...item,
                    title: cleanTitle(item.title),
                    views: EXPLORE_MORE_VIEW_COUNTS[exploreMoreVideos.indexOf(item)] ?? item.views,
                  }}
                  textOnly={true}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
