import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { videosAPI } from '../utils/api'
import { formatViewCount, formatRelativeTime, truncate } from '../utils/formatters'
import { CATEGORIES, PAGE_SIZE } from '../utils/constants'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import Badge from '../components/common/Badge'
import styles from './Home.module.css'

// VideoCard
function VideoCard({ video }) {
  // Backend sends thumbnail_url already fully formed (e.g. /videos/files/thumbnails/xxx)
  const thumbnailUrl = video.thumbnail_url || null

  return (
    <article className={styles.videoCard}>
      <Link to={`/watch/${video.id}`} className={styles.thumbnailLink}>
        <div className={styles.thumbnail}>
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={`Thumbnail for ${video.title}`}
              loading="lazy"
            />
          ) : (
            <div className={styles.thumbnailPlaceholder} aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
          )}
        </div>
      </Link>

      <div className={styles.cardInfo}>
        <Link to={`/watch/${video.id}`} className={styles.cardTitle}>
          {truncate(video.title, 60)}
        </Link>

        <Link to={`/profile/${video.creator?.username || video.creator_id}`} className={styles.cardCreator}>
          {video.creator?.username || `Creator #${video.creator_id}`}
        </Link>

        <div className={styles.cardMeta}>
          <span>{formatViewCount(video.views)} views</span>
          <span className={styles.metaDot} aria-hidden="true">·</span>
          <span>{formatRelativeTime(video.created_at)}</span>
        </div>
      </div>
    </article>
  )
}

// Home
export default function Home() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')

  const fetchVideos = useCallback(async (pageNum = 1, reset = false) => {
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)
    setError('')

    try {
      const data = await videosAPI.getFeed(pageNum, PAGE_SIZE)
      // Backend returns { results: [...], total, page, pages }
      const items = Array.isArray(data.results) ? data.results : []
      setVideos(prev => reset || pageNum === 1 ? items : [...prev, ...items])
      setHasMore(items.length === PAGE_SIZE)
      setPage(pageNum)
    } catch (err) {
      setError(err.message || 'Failed to load videos.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchVideos(1, true)
  }, [fetchVideos])

  function handleLoadMore() {
    if (!loadingMore && hasMore) fetchVideos(page + 1)
  }

  return (
    <div className={styles.page}>
      {/* Category filter bar */}
      <div className={styles.filterBar} role="navigation" aria-label="Browse by category">
        <button
          type="button"
          className={`${styles.filterChip} ${activeCategory === '' ? styles.filterChipActive : ''}`}
          onClick={() => setActiveCategory('')}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            type="button"
            className={`${styles.filterChip} ${activeCategory === cat.value ? styles.filterChipActive : ''}`}
            onClick={() => setActiveCategory(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Hero section (shown only when no filter active) */}
      {!activeCategory && !loading && videos.length > 0 && (
        <section className={styles.hero} aria-labelledby="hero-heading">
          <div className={styles.heroContent}>
            <Badge variant="primary" size="md">Learning Platform</Badge>
            <h1 id="hero-heading" className={styles.heroTitle}>
              Learn anything.<br />Track every step.
            </h1>
            <p className={styles.heroDesc}>
              Structured tutorials, progress tracking, and AI-powered quizzes to accelerate your growth.
            </p>
          </div>
        </section>
      )}

      {/* Video grid */}
      <section aria-label="Video feed">
        {!activeCategory && <h2 className={styles.sectionTitle}>Trending tutorials</h2>}

        {loading ? (
          <div className={styles.spinnerWrapper}>
            <LoadingSpinner size="lg" label="Loading videos…" />
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => fetchVideos(1, true)} />
        ) : videos.length === 0 ? (
          <div className={styles.empty}>
            <svg className={styles.emptyIcon} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            <h3>No videos yet</h3>
            <p className={styles.emptyText}>Check back soon. Creators are uploading new tutorials.</p>
          </div>
        ) : (
          <>
            <div className={styles.videoGrid}>
              {videos.map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>

            {hasMore && (
              <div className={styles.loadMoreWrapper}>
                <button
                  type="button"
                  className={styles.loadMoreBtn}
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <><LoadingSpinner size="sm" /> Loading…</>
                  ) : (
                    'Load more tutorials'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
