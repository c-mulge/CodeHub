// components/Navbar.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Navbar.module.scss';

export default function Navbar({ userEmail, onLogout }: { userEmail?: string; onLogout: () => void }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.navBrand}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <span className={styles.logoSymbol}>{'<>'}</span>
            </div>
            <span className={styles.logoText}>CodeHub</span>
          </Link>
        </div>

        <div className={styles.navCenter}>
          <div className={styles.searchContainer}>
            <input 
              type="text" 
              placeholder="Search repositories..." 
              className={styles.searchInput}
            />
            <div className={styles.searchIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
          </div>
        </div>

        <div className={styles.navRight}>
          <div className={`${styles.navLinks} ${isMobileMenuOpen ? styles.navLinksOpen : ''}`}>
            <Link href="/" className={styles.navLink}>
              <span className={styles.navLinkText}>Home</span>
            </Link>
            <Link href="/dashboard" className={styles.navLink}>
              <span className={styles.navLinkText}>Dashboard</span>
            </Link>
            <Link href="/explore" className={styles.navLink}>
              <span className={styles.navLinkText}>Explore</span>
            </Link>
            
            {userEmail ? (
              <div className={styles.userSection}>
                <div className={styles.userAvatar}>
                  <span className={styles.userInitial}>
                    {userEmail.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className={styles.userMenu}>
                  <div className={styles.userEmail}>{userEmail}</div>
                  <button onClick={onLogout} className={styles.logoutBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16,17 21,12 16,7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.authButtons}>
                <Link href="/login" className={styles.btnSecondary}>
                  Sign In
                </Link>
                <Link href="/register" className={styles.btnPrimary}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button 
            className={styles.mobileMenuBtn}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <div className={`${styles.hamburger} ${isMobileMenuOpen ? styles.hamburgerOpen : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={toggleMobileMenu}>
          <div className={styles.mobileMenu} onClick={e => e.stopPropagation()}>
            <div className={styles.mobileMenuHeader}>
              <span className={styles.mobileMenuTitle}>Navigation</span>
              <button 
                className={styles.closeBtn}
                onClick={toggleMobileMenu}
                aria-label="Close menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div className={styles.mobileMenuContent}>
              <Link href="/" className={styles.mobileNavLink} onClick={toggleMobileMenu}>
                <span className={styles.mobileNavIcon}>🏠</span>
                Home
              </Link>
              <Link href="/dashboard" className={styles.mobileNavLink} onClick={toggleMobileMenu}>
                <span className={styles.mobileNavIcon}>📊</span>
                Dashboard
              </Link>
              <Link href="/explore" className={styles.mobileNavLink} onClick={toggleMobileMenu}>
                <span className={styles.mobileNavIcon}>🔍</span>
                Explore
              </Link>
              
              {userEmail ? (
                <div className={styles.mobileUserSection}>
                  <div className={styles.mobileUserInfo}>
                    <div className={styles.mobileUserAvatar}>
                      {userEmail.charAt(0).toUpperCase()}
                    </div>
                    <span className={styles.mobileUserEmail}>{userEmail}</span>
                  </div>
                  <button onClick={onLogout} className={styles.mobileLogoutBtn}>
                    <span className={styles.mobileNavIcon}>🚪</span>
                    Logout
                  </button>
                </div>
              ) : (
                <div className={styles.mobileAuthButtons}>
                  <Link href="/login" className={styles.mobileBtnSecondary} onClick={toggleMobileMenu}>
                    Sign In
                  </Link>
                  <Link href="/register" className={styles.mobileBtnPrimary} onClick={toggleMobileMenu}>
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}