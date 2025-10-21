import Image from "next/image";
import Link from 'next/link';
import styles from './page.module.css';

export default function Homepage() {
  return (
    <>
      <header>
        <div className="logo">SportsPBL</div>
        <div className="header-right">
          <ul>
            <li><Link href="/login">LOGIN</Link></li>
            <li><Link href="/">TOP</Link></li>
            <li><Link href="/setting">Settings</Link></li>
          </ul>
        </div>
      </header>

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
            <p className={styles.title1}>野球部紹介</p>
            <p>
              昭和40年4月に創部。
              現在加盟する、福岡六大学野球連盟には連盟発足当時(昭和47年)から加盟。
              優勝回数は春・秋季合わせ、13回を数える。
              <br /><br />
              平成24年3月、塩浜総合グラウンド・FITスタジアムが完成。
              本施設は鵜木前理事長が、
              &quot;この野球道場の精神を&quot;礼節を重んじる人格の陶治&quot;と定める。&quot;
              児童、生徒、学生が、挨拶を責び、以て、地域との交わりを深め、いっそう人間力を形成し成長することを願い、この地に総合グラウンドとして設立した。
              <br /><br />
              学生野球の最高峰である大学野球。
              本学硬式野球部は、最高のプレーだけでなく、向き合う姿勢・熱量などすべてにおいて「学生野球の頂点へ」を目指し、日々汗を流しています。
              グラウンドでの全力疾走・挨拶・礼節といった野球を通じた人間力向上、グラウンドだけでなく、社会で活躍するプレーヤーを目指します。
              <br /><br />
              FITの大学生らしい溌剌とした、グラウンドを全力疾走で駆け回る姿・球場全体を轟かせる最大発声で、観客の皆様に感動を与えられるよう精進致します。
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
            <p className={styles.title2}>Rapsodoとは</p>
            <p>
              ラプソードは、野球・ソフトボール・ゴルフの投球・打球をカメラとレーダーで計測・分析するデータトラッキング機器です。
              計測されるデータには、キャリー、飛距離、クラブスピード、ボールスピード、打出角度、打出方向、ミート率などが含まれています
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