'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Target, Flame, BookOpen, Sparkles } from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/plan', label: 'Plan', icon: Target },
  { href: '/build', label: 'Build', icon: Flame },
  { href: '/review', label: 'Mind', icon: BookOpen },
  { href: '/insights', label: 'Insights', icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();

  // Hide sidebar on onboarding
  if (pathname === '/onboarding') return null;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoMark}>OS</span>
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
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <Link href="/capture" className={styles.captureLink}>
          <span className={styles.captureIcon}>+</span>
          <span>Quick Capture</span>
        </Link>
      </div>
    </aside>
  );
}
