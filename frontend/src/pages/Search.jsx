import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { videosAPI } from '../utils/api'
import { formatViewCount, formatNumericDate, truncate } from '../utils/formatters'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import styles from './Search.module.css'

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!query) return
    setLoading(true)
    setError('')
    videosAPI.getFeed(1, 20, query)
      .then(data => setVideos(Array.isArray(data.results) ? data.results : []))
      .catch(err => setError(err.message || 'Search failed.'))
      .finally(() => setLoading(false))
  }, [query])

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>
        {query ? <>Results for &ldquo;<span className={styles.queryText}>{query}</span>&rdquo;</> : 'Search'}
      </h1>

      {loading && <div className={styles.spinnerWrapper}><LoadingSpinner size="lg" /></div>}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && (
        videos.length === 0 ? (
          <div className={styles.empty}>
            <p>No results found{query ? ` for "${query}"` : ''}.</p>
          </div>
        ) : (
          <div className={styles.results}>
            {videos.map(v => (
              <article key={v.id} className={styles.resultItem}>
                <Link to={`/watch/${v.id}`} className={styles.thumb}>
                  <div className={styles.thumbInner}>
                    {v.thumbnail_url ? (
                      <img
                        src={v.thumbnail_url}
                        alt={`Thumbnail for ${v.title}`}
                        className={styles.thumbImage}
                      />
                    ) : (
                      <div className={styles.thumbPlaceholder} aria-hidden="true" />
                    )}
                  </div>
                </Link>
                <div className={styles.info}>
                  <Link to={`/watch/${v.id}`} className={styles.title}>
                    {truncate(v.title, 80)}
                  </Link>
                  <p className={styles.meta}>
                    {formatViewCount(v.views)} views · {formatNumericDate(v.created_at)}
                  </p>
                  {v.description && (
                    <p className={styles.desc}>{truncate(v.description, 120)}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )
      )}
    </div>
  )
}
