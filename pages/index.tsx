// pages/index.tsx
import React from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.scss';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { status } = useSession();
  const isLoggedIn = status === 'authenticated';

  return (
    <div>
      {/* Hero Section */}
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
            
            {!isLoggedIn && (
              <div className={styles.buttons}>
                <Link href="/register" className={styles.btnPrimary}>
                  <span className={styles.btnText}>Get Started</span>
                  <span className={styles.btnIcon}>→</span>
                </Link>
                <Link href="/login" className={styles.btnSecondary}>
                  <span className={styles.btnText}>Sign In</span>
                </Link>
              </div>
            )}
            
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

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Why Choose CodeHub?</h2>
            <p className={styles.sectionSubtitle}>
              Powerful features designed for modern development workflows
            </p>
          </div>
          
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureCardIcon}>🔐</div>
              <h3 className={styles.featureCardTitle}>Secure Repository Management</h3>
              <p className={styles.featureCardDescription}>
                Enterprise-grade security with private repositories, access controls, and encrypted data storage.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureCardIcon}>🌐</div>
              <h3 className={styles.featureCardTitle}>Real-time Collaboration</h3>
              <p className={styles.featureCardDescription}>
                Work together seamlessly with live editing, comments, and instant notifications.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureCardIcon}>⚡</div>
              <h3 className={styles.featureCardTitle}>Lightning Fast Performance</h3>
              <p className={styles.featureCardDescription}>
                Optimized infrastructure ensures your code is accessible and deployable in seconds.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureCardIcon}>📈</div>
              <h3 className={styles.featureCardTitle}>Advanced Analytics</h3>
              <p className={styles.featureCardDescription}>
                Track your development progress with detailed insights and performance metrics.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureCardIcon}>🔗</div>
              <h3 className={styles.featureCardTitle}>Seamless Integration</h3>
              <p className={styles.featureCardDescription}>
                Connect with your favorite tools and services through our extensive API ecosystem.
              </p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureCardIcon}>🎯</div>
              <h3 className={styles.featureCardTitle}>Project Management</h3>
              <p className={styles.featureCardDescription}>
                Organize your work with built-in project boards, issue tracking, and milestone management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className={styles.aboutSection}>
        <div className={styles.container}>
          <div className={styles.aboutContent}>
            <div className={styles.aboutText}>
              <h2 className={styles.sectionTitle}>About CodeHub</h2>
              <p className={styles.aboutDescription}>
                CodeHub was born from a simple idea: development should be accessible, collaborative, and secure. 
                We believe that great software comes from great teams, and great teams need great tools.
              </p>
              <p className={styles.aboutDescription}>
                Our platform combines the power of modern version control with intuitive collaboration features, 
                making it easier than ever for developers to work together, regardless of their location or experience level.
              </p>
              
              <div className={styles.aboutHighlights}>
                <div className={styles.highlight}>
                  <div className={styles.highlightIcon}>🌟</div>
                  <div className={styles.highlightText}>
                    <h4>Innovation First</h4>
                    <p>Cutting-edge features that evolve with your needs</p>
                  </div>
                </div>
                
                <div className={styles.highlight}>
                  <div className={styles.highlightIcon}>🤝</div>
                  <div className={styles.highlightText}>
                    <h4>Community Driven</h4>
                    <p>Built by developers, for developers</p>
                  </div>
                </div>
                
                <div className={styles.highlight}>
                  <div className={styles.highlightIcon}>🔒</div>
                  <div className={styles.highlightText}>
                    <h4>Security Focused</h4>
                    <p>Your code is protected with enterprise-grade security</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.aboutVisual}>
              <div className={styles.codeWindow}>
                <div className={styles.codeWindowHeader}>
                  <div className={styles.codeWindowControls}>
                    <span className={styles.controlRed}></span>
                    <span className={styles.controlYellow}></span>
                    <span className={styles.controlGreen}></span>
                  </div>
                  <span className={styles.codeWindowTitle}>welcome.js</span>
                </div>
                <div className={styles.codeWindowContent}>
                  <div className={styles.codeLine}>
                    <span className={styles.codeKeyword}>const</span>
                    <span className={styles.codeVariable}> welcome</span>
                    <span className={styles.codeOperator}> = </span>
                    <span className={styles.codeString}>"CodeHub"</span>
                  </div>
                  <div className={styles.codeLine}>
                    <span className={styles.codeKeyword}>function</span>
                    <span className={styles.codeFunction}> build</span>
                    <span className={styles.codeBracket}>(</span>
                    <span className={styles.codeParameter}>future</span>
                    <span className={styles.codeBracket}>) </span>
                  </div>
                  <div className={styles.codeLine}>
                    <span className={styles.codeIndent}>  </span>
                    <span className={styles.codeKeyword}>return</span>
                    <span className={styles.codeVariable}> collaborate</span>
                    <span className={styles.codeBracket}>(</span>
                    <span className={styles.codeParameter}>future</span>
                    <span className={styles.codeBracket}>)</span>
                  </div>
                  <div className={styles.codeLine}>
                    <span className={styles.codeBracket}> {'{'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to Start Building?</h2>
            <p className={styles.ctaDescription}>
              Join thousands of developers who trust CodeHub for their projects
            </p>
            {!isLoggedIn && (
              <div className={styles.ctaButtons}>
                <Link href="/register" className={styles.btnPrimary}>
                  <span className={styles.btnText}>Create Account</span>
                  <span className={styles.btnIcon}>🚀</span>
                </Link>
                <Link href="/login" className={styles.btnSecondary}>
                  <span className={styles.btnText}>Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <h3 className={styles.footerTitle}>CodeHub</h3>
              <p className={styles.footerDescription}>
                The modern platform for developers to store, share, and collaborate on code.
              </p>
              <div className={styles.footerSocial}>
                <a href="#" className={styles.socialLink}>
                  <span className={styles.socialIcon}>🐙</span>
                </a>
                <a href="#" className={styles.socialLink}>
                  <span className={styles.socialIcon}>🐦</span>
                </a>
                <a href="#" className={styles.socialLink}>
                  <span className={styles.socialIcon}>💼</span>
                </a>
              </div>
            </div>
            
            <div className={styles.footerSection}>
              <h4 className={styles.footerSectionTitle}>Product</h4>
              <ul className={styles.footerLinks}>
                <li><a href="#" className={styles.footerLink}>Features</a></li>
                <li><a href="#" className={styles.footerLink}>Pricing</a></li>
                <li><a href="#" className={styles.footerLink}>Documentation</a></li>
                <li><a href="#" className={styles.footerLink}>API</a></li>
              </ul>
            </div>
            
            <div className={styles.footerSection}>
              <h4 className={styles.footerSectionTitle}>Company</h4>
              <ul className={styles.footerLinks}>
                <li><a href="#" className={styles.footerLink}>About</a></li>
                <li><a href="#" className={styles.footerLink}>Blog</a></li>
                <li><a href="#" className={styles.footerLink}>Careers</a></li>
                <li><a href="#" className={styles.footerLink}>Contact</a></li>
              </ul>
            </div>
            
            <div className={styles.footerSection}>
              <h4 className={styles.footerSectionTitle}>Support</h4>
              <ul className={styles.footerLinks}>
                <li><a href="#" className={styles.footerLink}>Help Center</a></li>
                <li><a href="#" className={styles.footerLink}>Community</a></li>
                <li><a href="#" className={styles.footerLink}>Status</a></li>
                <li><a href="#" className={styles.footerLink}>Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className={styles.footerBottom}>
            <div className={styles.footerBottomContent}>
              <p className={styles.footerCopyright}>
                © 2024 CodeHub. All rights reserved.
              </p>
              <div className={styles.footerBottomLinks}>
                <a href="#" className={styles.footerBottomLink}>Privacy Policy</a>
                <a href="#" className={styles.footerBottomLink}>Terms of Service</a>
                <a href="#" className={styles.footerBottomLink}>Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}