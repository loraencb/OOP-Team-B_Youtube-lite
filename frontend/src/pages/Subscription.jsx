// Phase 5 - Subscription tier page (pricing table, upgrade flow)
import { TIER_FEATURES, TIERS } from '../utils/constants'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import styles from './Subscription.module.css'

// TODO: TEAM DECISION NEEDED
// Payment processing: Stripe, PayPal, or other?
// For now: UI for checkout flow without actual payment processing

export default function Subscription() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Badge variant="primary" size="md">Subscription Plans</Badge>
        <h1 className={styles.heading}>Choose your learning plan</h1>
        <p className={styles.subheading}>
          Upgrade to unlock premium content, AI quizzes, and advanced analytics.
        </p>
      </div>

      <div className={styles.tiers}>
        {Object.values(TIERS).map(tier => {
          const info = TIER_FEATURES[tier]
          const isMid = tier === TIERS.MID
          return (
            <div
              key={tier}
              className={`${styles.tierCard} ${isMid ? styles.tierCardPopular : ''}`}
            >
              {isMid && <span className={styles.popularBadge}>Most popular</span>}
              <div className={styles.tierHeader}>
                <h2 className={styles.tierName}>{info.label}</h2>
                <div className={styles.tierPrice}>
                  {info.price === 0 ? (
                    <span className={styles.tierFree}>Free</span>
                  ) : (
                    <>
                      <span className={styles.tierAmount}>${info.price}</span>
                      <span className={styles.tierPeriod}>/month</span>
                    </>
                  )}
                </div>
              </div>

              <ul className={styles.featureList}>
                {info.features.map(f => (
                  <li key={f} className={styles.featureItem}>
                    <svg className={styles.checkIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </li>
                ))}
                {info.limitations.map(l => (
                  <li key={l} className={`${styles.featureItem} ${styles.featureLimit}`}>
                    <svg className={styles.crossIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    {l}
                  </li>
                ))}
              </ul>

              <Button
                variant={isMid ? 'primary' : 'secondary'}
                size="md"
                fullWidth
                onClick={() => alert('Payment processing coming soon!')}
              >
                {info.price === 0 ? 'Current plan' : `Get ${info.label}`}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
