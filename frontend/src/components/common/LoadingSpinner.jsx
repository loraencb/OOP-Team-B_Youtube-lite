import styles from './LoadingSpinner.module.css'

/**
 * HowToob branded loading spinner.
 * size: 'sm' | 'md' | 'lg' | 'fullPage'
 */
export default function LoadingSpinner({ size = 'md', label = 'Loading…' }) {
  if (size === 'fullPage') {
    return (
      <div className={styles.fullPage} role="status" aria-label={label}>
        <div className={styles.spinnerLg}>
          <div className={styles.ring} />
          <span className={styles.logo}>H</span>
        </div>
        <p className={styles.text}>{label}</p>
      </div>
    )
  }

  return (
    <span
      className={`${styles.spinner} ${styles[size]}`}
      role="status"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
    </span>
  )
}
