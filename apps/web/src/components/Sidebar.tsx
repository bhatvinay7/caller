import Link from 'next/link';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  return (
    <nav className={styles.sidebar}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link href="/" className={styles.navLink}>Home</Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/chat" className={styles.navLink}>Chat</Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/settings" className={styles.navLink}>Settings</Link>
        </li>
      </ul>
    </nav>
  );
}
