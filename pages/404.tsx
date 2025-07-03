import Link from 'next/link';
import styles from '../styles/error.module.scss';
import { useEffect, useState } from 'react';

export default function Custom404() {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = '404 - Page Not Found';
  let index = 0;

  useEffect(() => {
    const typing = setInterval(() => {
      setDisplayedText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) clearInterval(typing);
    }, 150);
    return () => clearInterval(typing);
  }, []);

  return (
    <div className={styles.terminalPage}>
      <div className={styles.terminal}>
        <span className={styles.glitchText}>{displayedText}</span>
        <span className={styles.cursor}>|</span>
        <div className={styles.linkWrapper}>
          <Link href="/" className={styles.homeButton}>
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
