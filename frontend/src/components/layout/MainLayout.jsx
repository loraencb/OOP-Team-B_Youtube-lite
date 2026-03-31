import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../common/Navbar'
import Sidebar from '../common/Sidebar'
import { STORAGE_KEYS } from '../../utils/constants'
import styles from './MainLayout.module.css'

/**
 * MainLayout wraps all authenticated/main app pages.
 * Manages the sidebar collapsed/expanded state and persists it to localStorage.
 */
export default function MainLayout() {
  const isMobile = () => window.innerWidth <= 768

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // On mobile: sidebar starts closed; on desktop: respect saved preference
    if (isMobile()) return true
    const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED)
    return saved === 'true'
  })

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(sidebarCollapsed))
  }, [sidebarCollapsed])

  // Collapse sidebar on mobile when route changes
  function handleToggle() {
    setSidebarCollapsed(prev => !prev)
  }

  function handleCloseSidebar() {
    if (isMobile()) setSidebarCollapsed(true)
  }

  return (
    <div className={styles.layout}>
      <Navbar onToggleSidebar={handleToggle} isOpen={!sidebarCollapsed} />

      <Sidebar isCollapsed={sidebarCollapsed} onClose={handleCloseSidebar} />

      <main
        id="main-content"
        className={`${styles.main} ${sidebarCollapsed ? styles.mainExpanded : ''}`}
        tabIndex={-1}
      >
        <Outlet />
      </main>
    </div>
  )
}
