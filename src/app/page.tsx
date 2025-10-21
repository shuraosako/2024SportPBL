"use client";

import Image from "next/image";
import Link from 'next/link';
import Navigation from "@/components/layout/Navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from './page.module.css';

export default function Homepage() {
  const { t } = useLanguage();

  return (
    <>
      <Navigation showProfile={false} showHamburger={false} />

      <div className="header-underline"></div>

      <div className={styles.homepage}>
        <div style={{ width: '100%', marginTop: '20px' }}>
          <Image
            src="/images/baseball_ground.jpg"
            alt="baseball_stadium"
            layout="responsive"
            width={1300}
            height={200}
          />
        </div>

        <div className={styles.groundUnderline}></div>

        <div className={styles.fitEx}>
          <div className={styles.ex1}>
            <p className={styles.title1}>{t("top.clubIntroTitle")}</p>
            <p>
              {t("top.clubIntroPara1")}
              <br /><br />
              {t("top.clubIntroPara2")}
              <br /><br />
              {t("top.clubIntroPara3")}
              <br /><br />
              {t("top.clubIntroPara4")}
            </p>
          </div>
          <div className={styles.topFit}>
            <Image
              src="/images/fit.jpg"
              alt="fit"
              layout="responsive"
              width={600}
              height={600}
            />
          </div>
        </div>

        <div className={styles.groundUnderline}></div>

        <div className={styles.rapEx}>
          <div className={styles.rapFit}>
            <Image
              src="/images/rapsodo.jpg"
              alt="rap"
              layout="responsive"
              width={600}
              height={600}
            />
          </div>
          <div className={styles.ex2}>
            <p className={styles.title2}>{t("top.rapsodoTitle")}</p>
            <p>
              {t("top.rapsodoDescription")}
            </p>
          </div>
        </div>

        <div className={styles.groundUnderline}></div>

        <div className={styles.last}>
          <div className={styles.lastLine}></div>
        </div>
      </div>
    </>
  );
}