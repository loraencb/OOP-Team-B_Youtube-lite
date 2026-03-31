import { useEffect, useRef, useState } from 'react'
import { PRIMARY_CATEGORIES, SUB_CATEGORIES } from '../../utils/constants'
import styles from './SkillPathFilter.module.css'

export default function SkillPathFilter({ activeCategory, onCategoryChange }) {
  const [activePrimary, setActivePrimary] = useState(activeCategory || '')
  const [activeSubCategory, setActiveSubCategory] = useState('')
  const [connectorStyle, setConnectorStyle] = useState({})
  const containerRef = useRef(null)
  const activePrimaryRef = useRef(null)
  const tier2TreeRef = useRef(null)
  const tier2ScrollRef = useRef(null)
  const subButtonRefs = useRef([])

  const handlePrimaryClick = (value) => {
    setActivePrimary(value)
    setActiveSubCategory('')
    onCategoryChange(value)
  }

  const handleSubCategoryClick = (value) => {
    setActiveSubCategory(value)
    onCategoryChange(value)
  }

  const handleClearFilters = () => {
    setActivePrimary('')
    setActiveSubCategory('')
    onCategoryChange('')
  }

  const currentSubs = activePrimary ? SUB_CATEGORIES[activePrimary] : []

  useEffect(() => {
    function updateConnectorLayout() {
      if (!activePrimary || !containerRef.current || !activePrimaryRef.current || !tier2TreeRef.current || !tier2ScrollRef.current) {
        setConnectorStyle({})
        return
      }

      const containerRect = containerRef.current.getBoundingClientRect()
      const activeRect = activePrimaryRef.current.getBoundingClientRect()
      const treeRect = tier2TreeRef.current.getBoundingClientRect()
      const scrollRect = tier2ScrollRef.current.getBoundingClientRect()
      const validSubRefs = subButtonRefs.current.filter(Boolean)
      const desiredX = activeRect.left + activeRect.width / 2 - containerRect.left
      const treeHalfWidth = treeRect.width / 2
      const edgePadding = 24
      const minX = edgePadding + treeHalfWidth
      const maxX = containerRect.width - edgePadding - treeHalfWidth
      const treeX = Math.min(Math.max(desiredX, minX), maxX)
      const firstRect = validSubRefs[0]?.getBoundingClientRect()
      const lastRect = validSubRefs[validSubRefs.length - 1]?.getBoundingClientRect()
      const subLineStart = firstRect ? firstRect.left + firstRect.width / 2 - scrollRect.left : 0
      const subLineEnd = lastRect ? lastRect.left + lastRect.width / 2 - scrollRect.left : scrollRect.width

      setConnectorStyle({
        '--connector-x': `${desiredX}px`,
        '--tree-x': `${treeX}px`,
        '--connector-start': `${Math.min(desiredX, treeX)}px`,
        '--connector-end': `${Math.max(desiredX, treeX)}px`,
        '--sub-line-start': `${subLineStart}px`,
        '--sub-line-width': `${Math.max(subLineEnd - subLineStart, 0)}px`,
      })
    }

    updateConnectorLayout()
    window.addEventListener('resize', updateConnectorLayout)

    return () => window.removeEventListener('resize', updateConnectorLayout)
  }, [activePrimary, currentSubs.length])

  return (
    <div className={styles.skillPathContainer} ref={containerRef}>
      {/* Tier 1: Primary Categories */}
      <div className={styles.tier1Container}>
        <button
          type="button"
          className={`${styles.primaryButton} ${!activePrimary ? styles.primaryButtonActive : ''}`}
          onClick={handleClearFilters}
        >
          <span>All</span>
          {!activePrimary && <div className={styles.indicatorDot} />}
        </button>

        {PRIMARY_CATEGORIES.map(cat => (
          <button
            key={cat.value}
            type="button"
            ref={activePrimary === cat.value ? activePrimaryRef : null}
            className={`${styles.primaryButton} ${activePrimary === cat.value ? styles.primaryButtonActive : ''}`}
            onClick={() => handlePrimaryClick(cat.value)}
          >
            <span>{cat.label}</span>
            {activePrimary === cat.value && <div className={styles.indicatorDot} />}
          </button>
        ))}
      </div>

      {/* Tier 2: Sub-Categories (appears when primary is selected) */}
      {currentSubs.length > 0 && (
        <div className={styles.tier2Container} style={connectorStyle}>
          <div className={styles.tier2Tree} ref={tier2TreeRef}>
            <div className={styles.tier2Scroll} ref={tier2ScrollRef}>
              {currentSubs.map((sub, index) => (
                <div
                  key={sub.value}
                  className={styles.subButtonWrap}
                  ref={element => {
                    subButtonRefs.current[index] = element
                  }}
                >
                  <button
                    type="button"
                    className={`${styles.subButton} ${activeSubCategory === sub.value ? styles.subButtonActive : ''}`}
                    onClick={() => handleSubCategoryClick(sub.value)}
                  >
                    {sub.label}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
