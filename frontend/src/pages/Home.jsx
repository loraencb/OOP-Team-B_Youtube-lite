import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { videosAPI } from '../utils/api'
import { formatViewCount, formatNumericDate, truncate } from '../utils/formatters'
import { PAGE_SIZE } from '../utils/constants'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import VideoCard from '../components/common/VideoCard'
import SkillPathFilter from '../components/common/SkillPathFilter'
import styles from './Home.module.css'

// Group videos by category so we can build the home sections.
function groupVideosByCategory(videosList) {
  const categories = {}

  videosList.forEach(video => {
    let category = video.category
    
    if (!category) return

    if (!categories[category]) {
      categories[category] = []
    }
    categories[category].push(video)
  })

  Object.keys(categories).forEach(key => {
    categories[key].sort((a, b) => b.views - a.views)
  })

  // Keep only categories that actually have videos.
  const filtered = {}
  Object.keys(categories).forEach(key => {
    if (categories[key].length > 0) {
      filtered[key] = categories[key]
    }
  })

  return filtered
}

function cleanTitle(title) {
  if (!title) return ''
  return title.replace(/^[^:]+:\s*/, '')
}

const PLACEHOLDER_TITLES = {
  'Computer Science': [
    'Advanced React Patterns',
    'Fullstack Node.js Guide',
    'Python Data Science 101',
    'Mastering CSS Grid',
    'Docker Basics'
  ],
  'Finance & Business': [
    'Startup Strategies',
    'Personal Finance Masterclass',
    'Investing 101',
    'Building a Business Plan',
    'Crypto Explained'
  ],
  'Arts & Design': [
    'Digital Illustration Basics',
    'Color Theory in Practice',
    'UI/UX Principles',
    'Typography Masterclass',
    'Logo Design Workshop'
  ],
  'Fitness & Wellness': [
    '30-Minute Body HIIT',
    'Yoga Flow for Flexibility',
    'Nutrition and Meal Prep',
    'Strength Training Basics',
    'Mindful Meditation'
  ]
}

const FALLBACK_TITLES = [
  'Beginner Fundamentals Guide',
  'Advanced Techniques Masterclass',
  'Tips and Tricks for Success',
  'Professional Series Workshop',
  'Essential Skills Training'
]

const TIER_TWO_TITLES = new Set([
  'Mastering CSS Grid',
  'Strength Training',
  'Strength Training Basics',
  'Building a Business Plan',
  'Typography Masterclass'
])

const EXPLORE_MORE_VIEW_COUNTS = [118, 164, 207, 243, 319, 362, 418, 487]

function getPlaceholderTitle(categoryName, index) {
  const titles = PLACEHOLDER_TITLES[categoryName] || FALLBACK_TITLES
  return titles[index % titles.length]
}

function getCardBadgeLabel(title, defaultLabel) {
  return TIER_TWO_TITLES.has(cleanTitle(title)) ? 'Tier 2' : defaultLabel
}

function PlayOverlay() {
  return (
    <div className={styles.playOverlay} aria-hidden="true">
      <div className={styles.playButton}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="8 6 19 12 8 18 8 6" />
        </svg>
      </div>
    </div>
  )
}

// Show a simple placeholder when a card has no real thumbnail yet.
function ThumbnailPlaceholder({ primary = false }) {
  return (
    <div className={styles.bentoGhost} style={{ height: '100%', width: '100%', border: 'none' }}>
      <div className={styles.bentoPlaceholder}>
        <svg
          width={primary ? 48 : 32}
          height={primary ? 48 : 32}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </div>
      <div className={styles.bentoGhostLabel}>Coming soon</div>
    </div>
  )
}

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

  const categorySections = useMemo(() => {
    let sections = {}
    if (videos.length > 5) {
      sections = groupVideosByCategory(videos.slice(5))
    }
    
    // Add placeholder categories if we do not have enough real ones yet.
    const placeholderCategories = [
      'Computer Science',
      'Finance & Business',
      'Arts & Design',
      'Fitness & Wellness'
    ]
    
    // Keep at least four category sections on the page.
    for (const cat of placeholderCategories) {
      if (!sections[cat] && Object.keys(sections).length < 4) {
        sections[cat] = []
      }
    }
    
    return sections
  }, [videos])

  function handleLoadMore() {
    if (!loadingMore && hasMore) fetchVideos(page + 1)
  }

  return (
    <div className={styles.page}>
      {/* Category filter */}
      <SkillPathFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Home feed */}
      <section aria-label="Video feed" className={styles.bentoSection}>
        {loading ? (
          <div className={styles.spinnerWrapper}>
            <LoadingSpinner size="lg" label="Loading videos…" />
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => fetchVideos(1, true)} />
        ) : (
          <>
            {/* ── Main Bento Grid (always rendered) ── */}
            <div className={styles.bentoGrid}>

              {/* Main featured card */}
              <div className={`${styles.bentoCard} ${styles.bentoPrimary}`} aria-label="Continue Learning">
                {(() => {
                  const v = videos[0] || {
                    title: 'Welcome: Platform Overview',
                    views: 0,
                    created_at: new Date().toISOString()
                  }
                  
                  return (
                    <>
                      <div className={styles.bentoLabel}>Continue Learning</div>
                      <Link to={v.id ? `/watch/${v.id}` : '#'} className={styles.bentoLink}>
                        <div className={styles.bentoThumbnail}>
                          {v.thumbnail_url ? (
                            <>
                              <img src={v.thumbnail_url} alt={v.title} />
                              {v.id && <PlayOverlay />}
                            </>
                          ) : (
                            <ThumbnailPlaceholder primary={true} />
                          )}
                        </div>
                        <div className={styles.bentoTitle}>{truncate(cleanTitle(v.title), 80)}</div>
                        <div className={styles.bentoMeta}>
                          <span>{formatViewCount(v.views || 0)} views</span>
                          <span className={styles.bentoDot}>·</span>
                          <span>{formatNumericDate(v.created_at || new Date())}</span>
                        </div>
                      </Link>
                    </>
                  )
                })()}
              </div>

              {/* Two smaller new upload cards */}
              {[videos[1], videos[2]].map((video, idx) => {
                const v = video || { title: `New Upload: Series ${idx + 1}` }
                return (
                  <div key={v.id ?? `ghost-new-${idx}`} className={`${styles.bentoCard} ${styles.bentoSecondary}`} aria-label={`New Upload ${idx + 1}`} style={{ cursor: 'default' }}>
                    <div className={styles.bentoLabel}>New Upload</div>
                    <div className={styles.bentoLink}>
                      <div className={styles.bentoThumbnail}>
                        <ThumbnailPlaceholder primary={false} />
                      </div>
                      <div className={styles.bentoTitle}>{truncate(cleanTitle(v.title), 60)}</div>
                    </div>
                  </div>
                )
              })}

              {/* Two smaller tiered cards */}
              {[videos[3], videos[4]].map((video, idx) => {
                const v = video || { title: `Premium Features: Spotlight ${idx + 1}` }
                return (
                  <div key={v.id ?? `ghost-tier-${idx}`} className={`${styles.bentoCard} ${styles.bentoTiered}`} aria-label={`Tiered Content ${idx + 1}`} style={{ cursor: 'default' }}>
                    <div className={styles.bentoLabel}>{getCardBadgeLabel(v.title, 'Tier 1')}</div>
                    <div className={styles.bentoLink}>
                      <div className={styles.bentoThumbnail}>
                        <ThumbnailPlaceholder primary={false} />
                      </div>
                      <div className={styles.bentoTitle}>{truncate(cleanTitle(v.title), 60)}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Category-Based Bento Sections ── */}
            {Object.entries(categorySections).map((entry, sectionIdx) => {
              const [categoryName, categoryVideos] = entry
              const alternateLayout = (sectionIdx + 1) % 2 !== 0 // Start alternating from the first category (which is under the main section)
              const topVideo = categoryVideos[0]
              const otherVideos = categoryVideos.slice(1, 5)

              return (
                <section key={categoryName} className={styles.categorySectionContainer}>
                  <div className={styles.categoryHeader}>
                    <h2 className={styles.categoryTitle}>{categoryName}</h2>
                    <Link to={`/search?category=${categoryName}`} className={styles.categoryViewAll}>View all →</Link>
                  </div>

                  <div className={`${styles.bentoGrid} ${alternateLayout ? styles.miniBentoGridReverse : styles.miniBentoGrid}`}>
                    {/* Featured card */}
                    {(() => {
                      const v = topVideo || {
                        title: getPlaceholderTitle(categoryName, 0),
                        views: 0,
                        created_at: new Date().toISOString()
                      }
                      return (
                        <div className={`${styles.bentoCard} ${styles.bentoPrimary}`} style={{ cursor: 'default' }}>
                          <div className={styles.bentoLabel}>Most Popular</div>
                          <div className={styles.bentoLink}>
                            <div className={styles.bentoThumbnail}>
                              <ThumbnailPlaceholder primary={true} />
                            </div>
                            <div className={styles.bentoTitle}>{truncate(cleanTitle(v.title), 80)}</div>
                            <div className={styles.bentoMeta}>
                              <span>{formatViewCount(v.views || 0)} views</span>
                              <span className={styles.bentoDot}>·</span>
                              <span>{formatNumericDate(v.created_at || new Date().toISOString())}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })()}

                    {/* Four smaller cards */}
                    {Array.from({ length: 4 }).map((_, i) => {
                      const video = otherVideos[i]
                      const cardClass = i < 2 ? styles.bentoSecondary : styles.bentoTiered
                      const v = video || {
                        title: getPlaceholderTitle(categoryName, i + 1)
                      }
                      return (
                        <div key={v.id ?? `cat-${categoryName}-ghost-${i}`} className={`${styles.bentoCard} ${cardClass}`} style={{ cursor: 'default' }}>
                          <div className={styles.bentoLabel}>{getCardBadgeLabel(v.title, i < 2 ? 'New Upload' : 'Tier 1')}</div>
                          <div className={styles.bentoLink}>
                            <div className={styles.bentoThumbnail}>
                              <ThumbnailPlaceholder primary={false} />
                            </div>
                            <div className={styles.bentoTitle}>{truncate(cleanTitle(v.title), 60)}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })}

            {/* Browse All */}
            {videos.length > 5 && (
              <div className={styles.bentoFooter}>
                <h2 className={styles.sectionTitle}>Explore More</h2>
                <div className={styles.videoGrid}>
                  {videos.slice(5).map((video, index) => (
                    <VideoCard
                      key={video.id}
                      video={{
                        ...video,
                        title: cleanTitle(video.title),
                        views: EXPLORE_MORE_VIEW_COUNTS[index] ?? video.views,
                      }}
                      textOnly={true}
                    />
                  ))}
                  {/* Fill empty spot in the grid line */}
                  <VideoCard 
                    key="explore-placeholder" 
                    video={{
                      id: 'placeholder',
                      title: 'React Fundamentals',
                      creator: { username: 'Creator #1' },
                      views: EXPLORE_MORE_VIEW_COUNTS[videos.slice(5).length] ?? 451,
                      created_at: new Date().toISOString()
                    }} 
                    textOnly={true} 
                  />
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
