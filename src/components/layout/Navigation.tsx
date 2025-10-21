"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitch from "@/components/LanguageSwitch";
import styles from "./Navigation.module.css";

interface NavigationProps {
  showProfile?: boolean;
  showHamburger?: boolean;
}

export default function Navigation({ showProfile = false, showHamburger = false }: NavigationProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        if (showProfile) {
          try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const data = userDoc.data();
              const username = data?.username || user.email;
              setUserName(username);
              setProfileImage(data?.profileImageUrl || null);
            } else {
              setUserName(user.email);
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
            setUserName(user.email);
          }
        }
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, [showProfile]);

  const toggleProfilePopup = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const navigateToProfile = () => {
    router.push("/profile");
  };

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          {showHamburger && (
            <div className={styles.hamburger} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              &#9776;
            </div>
          )}
          <div className={styles.logo}>
            <Link href="/">{t("app.title")}</Link>
          </div>
          <div className={styles.headerRight}>
            {showProfile && isAuthenticated ? (
              <div className={styles.profileSection} onClick={toggleProfilePopup}>
                <div className={styles.profileInfo}>
                  <Image
                    src={profileImage || "/default-profile.png"}
                    alt="Profile"
                    className={styles.profileImage}
                    width={40}
                    height={40}
                  />
                  <span className={styles.username}>{userName || "Guest"}</span>
                </div>
                {isProfileOpen && (
                  <div className={styles.profilePopup}>
                    <p>{userName}</p>
                    <button onClick={navigateToProfile}>{t("nav.profile")}</button>
                    <button onClick={handleLogout}>{t("nav.logout")}</button>
                  </div>
                )}
              </div>
            ) : (
              <ul>
                <li><Link href="/login">{t("nav.login")}</Link></li>
                <li><Link href="/">{t("nav.top")}</Link></li>
              </ul>
            )}
            <LanguageSwitch />
          </div>
        </div>
      </header>

      {showHamburger && (
        <div className={`${styles.sidebar} ${isMenuOpen ? styles.sidebarOpen : ""}`}>
          <nav className={styles.sidebarNav}>
            <Link href="/home" onClick={() => setIsMenuOpen(false)}>
              <div className={styles.navItem}>{t("nav.home")}</div>
            </Link>
            <Link href="/analysis" onClick={() => setIsMenuOpen(false)}>
              <div className={styles.navItem}>{t("nav.analysis")}</div>
            </Link>
            <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
              <div className={styles.navItem}>{t("nav.profile")}</div>
            </Link>
            <Link href="/setting" onClick={() => setIsMenuOpen(false)}>
              <div className={styles.navItem}>{t("nav.settings")}</div>
            </Link>
          </nav>
        </div>
      )}

      {isMenuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}
