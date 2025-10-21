"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithEmailAndPassword, PhoneAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Navigation from "@/components/layout/Navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from './login.module.css';

export default function Login() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPhoneSignIn, setShowPhoneSignIn] = useState(false);

  const handleLoginClick = async () => {
    setError("");
    setIsLoading(true);

    try {
      if (!showPhoneSignIn) {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/home");
      } else {
        const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: (response: any) => {
            console.log('reCAPTCHA solved');
          },
          'expired-callback': () => {
            console.warn('reCAPTCHA expired');
          },
        });
        await recaptchaVerifier.render();
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
        setVerificationId(confirmationResult.verificationId);
        alert("OTP sent to your phone number.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to log in. Please check your credentials or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpClick = async () => {
    if (!verificationId || !otp) {
      alert("Please enter the OTP.");
      return;
    }

    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      alert("Phone number verified successfully.");
      router.push("/home");
    } catch (err) {
      console.error("OTP verification error:", err);
      setError("Failed to verify OTP. Please try again.");
    }
  };

  return (
    <>
      <Navigation showProfile={false} showHamburger={false} />

      <div className={styles.logunder}>
        <div className={styles.log}>
          <div className={styles.signInToggle}>
            <button type="button" onClick={() => setShowPhoneSignIn(false)}>
              メールでログイン
            </button>
            <button type="button" onClick={() => setShowPhoneSignIn(true)}>
              電話番号でログイン
            </button>
          </div>

          {!showPhoneSignIn && (
            <>
              <div className="inputfield">
                <label>メールアドレス</label>
                <input
                  type="email"
                  id="mailaddress"
                  name="mailaddress"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="inputfield">
                <label>パスワード</label>
                <input
                  type="password"
                  id="pass"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {showPhoneSignIn && (
            <div className="inputfield">
              <label>電話番号</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+81 90-1234-5678"
                required
              />
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="button"
            onClick={handleLoginClick}
            disabled={isLoading}
            className={styles.loginButton}
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>

          {verificationId && (
            <div className="inputfield">
              <label>認証コード</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="認証コードを入力"
                required
              />
              <button
                type="button"
                onClick={handleVerifyOtpClick}
                disabled={isLoading}
                className={styles.loginButton}
              >
                認証
              </button>
            </div>
          )}

          <div className={styles.addition}>
            <Link href="/forgot_pass">＞パスワードを忘れた方</Link>
            <br />
            <Link href="/New-Account">＞新しいアカウントを作る方</Link>
          </div>
        </div>
      </div>

      <div className={styles.last}>
        <div className={styles.lastLine}></div>
      </div>

      <div id="recaptcha-container"></div>
    </>
  );
}