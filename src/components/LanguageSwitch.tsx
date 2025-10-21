"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./LanguageSwitch.module.css";

export default function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={styles.languageSwitch}>
      <button
        className={`${styles.langButton} ${language === "ja" ? styles.active : ""}`}
        onClick={() => setLanguage("ja")}
      >
        JP
      </button>
      <button
        className={`${styles.langButton} ${language === "en" ? styles.active : ""}`}
        onClick={() => setLanguage("en")}
      >
        EN
      </button>
    </div>
  );
}
