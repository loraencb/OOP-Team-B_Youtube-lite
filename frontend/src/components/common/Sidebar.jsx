import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { CATEGORIES } from '../../utils/constants'
import styles from './Sidebar.module.css'

// SVG icon helpers
const Icon = {
  Home: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Subscriptions: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.87v6.26a1 1 0 0 1-1.447.894L15 14"/><rect x="1" y="6" width="15" height="12" rx="2"/></svg>,
  Dashboard: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  History: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.02"/></svg>,
  Playlists: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  MyVideos: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  Categories: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Settings: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  ChevronDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
}

export default function Sidebar({ isCollapsed, onClose }) {
  const { isAuthenticated, isCreator } = useAuth()
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const location = useLocation()

  function navItemClass({ isActive }) {
    return [styles.navItem, isActive ? styles.navItemActive : ''].join(' ')
  }

  return (
    <>
      {/* Mobile overlay backdrop */}
      {!isCollapsed && (
        <div
          className={styles.backdrop}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
        aria-label="Site navigation"
      >
        <nav>
          {/* Discover */}
          <div className={styles.section}>
            {!isCollapsed && <p className={styles.sectionLabel}>Discover</p>}

            <NavLink to="/" end className={navItemClass}>
              <span className={styles.navIcon}><Icon.Home /></span>
              {!isCollapsed && <span className={styles.navText}>Home</span>}
            </NavLink>
          </div>

          {/* My Learning */}
          <div className={styles.section}>
              {!isCollapsed && <p className={styles.sectionLabel}>My Learning</p>}

              <NavLink to="/dashboard" className={navItemClass}>
                <span className={styles.navIcon}><Icon.Dashboard /></span>
                {!isCollapsed && <span className={styles.navText}>My Dashboard</span>}
              </NavLink>

              <NavLink to="/subscription" className={navItemClass}>
                <span className={styles.navIcon}><Icon.Subscriptions /></span>
                {!isCollapsed && <span className={styles.navText}>Subscriptions</span>}
              </NavLink>

              <NavLink to="/history" className={navItemClass}>
                <span className={styles.navIcon}><Icon.History /></span>
                {!isCollapsed && <span className={styles.navText}>Watch History</span>}
              </NavLink>

              <NavLink to="/my-playlists" className={navItemClass}>
                <span className={styles.navIcon}><Icon.Playlists /></span>
                {!isCollapsed && <span className={styles.navText}>My Playlists</span>}
              </NavLink>
            </div>
          {/* Creator */}
          <div className={styles.section}>
              {!isCollapsed && <p className={styles.sectionLabel}>Creator</p>}

              <NavLink to="/creator-dashboard" className={navItemClass}>
                <span className={styles.navIcon}><Icon.MyVideos /></span>
                {!isCollapsed && <span className={styles.navText}>Creator Studio</span>}
              </NavLink>
            </div>
          {/* Browse */}
          <div className={styles.section}>
            {!isCollapsed && <p className={styles.sectionLabel}>Browse</p>}

            {/* Categories accordion */}
            <button
              type="button"
              className={`${styles.navItem} ${styles.accordionTrigger}`}
              onClick={() => setCategoriesOpen(prev => !prev)}
              aria-expanded={categoriesOpen}
            >
              <span className={styles.navIcon}><Icon.Categories /></span>
              {!isCollapsed && (
                <>
                  <span className={styles.navText}>Categories</span>
                  <span className={`${styles.chevron} ${categoriesOpen ? styles.chevronOpen : ''}`}>
                    <Icon.ChevronDown />
                  </span>
                </>
              )}
            </button>

            {categoriesOpen && !isCollapsed && (
              <ul className={styles.categoryList}>
                {CATEGORIES.map(cat => (
                  <li key={cat.value}>
                    <NavLink
                      to={`/search?category=${cat.value}`}
                      className={({ isActive }) =>
                        [styles.categoryItem, location.search.includes(cat.value) ? styles.navItemActive : ''].join(' ')
                      }
                    >
                      {cat.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Account */}
          <div className={styles.section}>
              {!isCollapsed && <p className={styles.sectionLabel}>Account</p>}

              <NavLink to="/settings" className={navItemClass}>
                <span className={styles.navIcon}><Icon.Settings /></span>
                {!isCollapsed && <span className={styles.navText}>Settings</span>}
              </NavLink>
            </div>
        </nav>
      </aside>
    </>
  )
}
