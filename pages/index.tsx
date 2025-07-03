// pages/index.tsx
import React from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.scss';

export default function Home() {
  return (
    <div className={styles.hero}>
      <div className={styles.backgroundElements}>
        <div className={styles.floatingCode}>
          <div className={styles.codeBlock}>
            <span className={styles.codeText}>{'<CodeHub />'}</span>
          </div>
          <div className={styles.codeBlock}>
            <span className={styles.codeText}>{'git push'}</span>
          </div>
          <div className={styles.codeBlock}>
            <span className={styles.codeText}>{'npm install'}</span>
          </div>
          <div className={styles.codeBlock}>
            <span className={styles.codeText}>{'function() {'}</span>
          </div>
          <div className={styles.codeBlock}>
            <span className={styles.codeText}>{'return true;'}</span>
          </div>
          <div className={styles.codeBlock}>
            <span className={styles.codeText}>{'}'}</span>
          </div>
        </div>
        <div className={styles.gridPattern}></div>
      </div>
      
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.badge}>
            <span className={styles.badgeText}>✨ New Platform</span>
          </div>
          
          <h1 className={styles.title}>
            <span className={styles.titleMain}>Welcome to</span>
            <span className={styles.titleBrand}>CodeHub</span>
          </h1>
          
          <p className={styles.subtitle}>
            The modern platform for developers to store, share, and collaborate on code. 
            Join thousands of developers building the future together.
          </p>
          
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🚀</div>
              <span>Fast & Secure</span>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>👥</div>
              <span>Collaborate</span>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>📊</div>
              <span>Analytics</span>
            </div>
          </div>
          
          <div className={styles.buttons}>
            <Link href="/register" className={styles.btnPrimary}>
              <span className={styles.btnText}>Get Started</span>
              <span className={styles.btnIcon}>→</span>
            </Link>
            <Link href="/login" className={styles.btnSecondary}>
              <span className={styles.btnText}>Sign In</span>
            </Link>
          </div>
          
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statNumber}>10K+</div>
              <div className={styles.statLabel}>Developers</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>50K+</div>
              <div className={styles.statLabel}>Repositories</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>1M+</div>
              <div className={styles.statLabel}>Lines of Code</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.scrollIndicator}>
        <div className={styles.scrollDot}></div>
      </div>
    </div>
  );
}