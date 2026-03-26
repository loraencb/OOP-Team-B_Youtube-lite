import styles from './Badge.module.css'

/**
 * Badge component for category tags, tier labels, and status chips.
 *
 * variant: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
 *          | 'tier-free' | 'tier-mid' | 'tier-premium'
 * size: 'sm' | 'md'
 */
export default function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  return (
    <span
      className={[
        styles.badge,
        styles[variant.replace('-', '_')],
        styles[size],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
