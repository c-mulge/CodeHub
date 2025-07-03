// components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Navbar.module.scss';
import { useRouter } from 'next/router';

export default function Navbar({ userEmail, onLogout }: { userEmail?: string; onLogout: () => void }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '', description: '', profilePic: '' });
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (userEmail) {
      fetch('/api/user/me').then(res => res.json()).then(data => {
        setProfile({
          name: data.name || '',
          email: data.email || '',
          description: data.description || '',
          profilePic: data.profilePic || '',
        });
      });
    }
  }, [userEmail, router.asPath]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.asPath]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      router.push(`/explore?query=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicFile(e.target.files[0]);
      // Show preview
      setProfile(p => ({ ...p, profilePic: URL.createObjectURL(e.target.files![0]) }));
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileError('');
    setProfileSuccess('');
    let profilePicUrl = profile.profilePic;
    if (profilePicFile) {
      const formData = new FormData();
      formData.append('profilePic', profilePicFile);
      const res = await fetch('/api/user/upload-profile-pic', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        profilePicUrl = data.url;
      } else {
        setProfileError(data.message || 'Failed to upload profile picture');
        setSaving(false);
        return;
      }
    }
    // Save profile
    const res = await fetch('/api/user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: profile.name,
        description: profile.description,
        profilePic: profilePicUrl,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setProfileSuccess('Profile updated!');
      setShowProfileModal(false);
    } else {
      setProfileError(data.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  // Close menu when a mobile link is clicked
  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
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
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
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
                <Link href="/profile" className={styles.userAvatar} style={{ cursor: 'pointer' }}>
                  {profile.profilePic ? (
                    <img src={profile.profilePic} alt="Profile" className={styles.profilePicImg} />
                  ) : (
                    <span className={styles.userInitial}>
                      {userEmail.charAt(0).toUpperCase()}
                    </span>
                  )}
                </Link>
                <div className={styles.userMenu}>
                  <button onClick={onLogout} className={styles.logoutBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16,17 21,12 16,7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Logout
                  </button>
                </div>
                {showProfileModal && (
                  <div className={styles.profileModalOverlay} onClick={() => setShowProfileModal(false)}>
                    <div className={styles.profileModal} onClick={e => e.stopPropagation()}>
                      <h2>Edit Profile</h2>
                      {profileError && <div className={styles.profileError}>{profileError}</div>}
                      {profileSuccess && <div className={styles.profileSuccess}>{profileSuccess}</div>}
                      <form onSubmit={handleProfileSave}>
                        <div className={styles.profilePicEditSection}>
                          <label htmlFor="profilePicInput">
                            {profile.profilePic ? (
                              <img src={profile.profilePic} alt="Profile Preview" className={styles.profilePicPreview} />
                            ) : (
                              <div className={styles.profilePicPlaceholder}>Add Photo</div>
                            )}
                          </label>
                          <input id="profilePicInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfilePicChange} />
                        </div>
                        <div className={styles.profileField}>
                          <label>Name</label>
                          <input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} required />
                        </div>
                        <div className={styles.profileField}>
                          <label>Description</label>
                          <textarea value={profile.description} onChange={e => setProfile(p => ({ ...p, description: e.target.value }))} />
                        </div>
                        <button type="submit" className={styles.profileSaveBtn} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                      </form>
                    </div>
                  </div>
                )}
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
            aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
            aria-expanded={isMobileMenuOpen}
            style={{ zIndex: 3000, position: 'relative' }}
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
        <div className={styles.mobileOverlay} onClick={toggleMobileMenu} style={{ zIndex: 2999 }}>
          <div className={styles.mobileMenu} onClick={e => e.stopPropagation()} style={{ zIndex: 3001 }}>
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
              <Link href="/" className={styles.mobileNavLink} onClick={handleMobileLinkClick}>
                <span className={styles.mobileNavIcon}>🏠</span>
                Home
              </Link>
              <Link href="/dashboard" className={styles.mobileNavLink} onClick={handleMobileLinkClick}>
                <span className={styles.mobileNavIcon}>📊</span>
                Dashboard
              </Link>
              <Link href="/explore" className={styles.mobileNavLink} onClick={handleMobileLinkClick}>
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
                  <button onClick={() => { onLogout(); handleMobileLinkClick(); }} className={styles.mobileLogoutBtn}>
                    <span className={styles.mobileNavIcon}>🚪</span>
                    Logout
                  </button>
                </div>
              ) : (
                <div className={styles.mobileAuthButtons}>
                  <Link href="/login" className={styles.mobileBtnSecondary} onClick={handleMobileLinkClick}>
                    Sign In
                  </Link>
                  <Link href="/register" className={styles.mobileBtnPrimary} onClick={handleMobileLinkClick}>
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