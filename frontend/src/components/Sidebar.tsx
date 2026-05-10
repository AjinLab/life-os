'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Crosshair, Zap, Target, CheckCircle, BookOpen, Sparkles } from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/capture', label: 'Capture', icon: Zap },
  { href: '/plan', label: 'Plan', icon: Target },
  { href: '/habits', label: 'Habits', icon: CheckCircle },
  { href: '/review', label: 'Review', icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();

  // Hide sidebar on onboarding
  if (pathname === '/onboarding') return null;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <Crosshair size={18} />
        </div>
        <span className={styles.logoText}>Life OS</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {isActive && <div className={styles.activeIndicator} />}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.aiChip}>
          <Sparkles size={14} />
          <span>AI Coach</span>
        </div>
      </div>
    </aside>
  );
}
