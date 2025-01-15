"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, PhoneAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCoq3lwqjKG1Ja9OQMlmQyOsBFot_fEMXU",
  authDomain: "sports-pbl.firebaseapp.com",
  projectId: "sports-pbl",
  storageBucket: "sports-pbl.appspot.com",
  messagingSenderId: "182306703534",
  appId: "1:182306703534:web:86b8757669edf89f24453f",
  measurementId: "G-FYNN6VTDMJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export Firebase instances
export { db, storage };

// Login Component
export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPhoneSignIn, setShowPhoneSignIn] = useState(false); // State to toggle views

  const handleLoginClick = async () => {
    setError("");
    setIsLoading(true);

    try {
      if (!showPhoneSignIn) {
        // Email login
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/home");
      } else {
        // Phone login
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
      <header>
        <div className="logo">SportsPBL</div>
        <div className="header-right">
          <ul>
            <li><Link href="/login">LOGIN</Link></li>
            <li><Link href="http://localhost:3000">TOP</Link></li>
            <li><a href="#">Settings</a></li>
          </ul>
        </div>
      </header>

      <div className="logunder">
        <div className="log">
          {/* Toggle between email and phone sign-in */}
          <div className="sign-in-toggle">
            <button type="button" onClick={() => setShowPhoneSignIn(false)}>
              Email Sign-In/
            </button>
            <button type="button" onClick={() => setShowPhoneSignIn(true)}>
              Phone Sign-In
            </button>
          </div>

          {/* Email sign-in form */}
          {!showPhoneSignIn && (
            <>
              <div className="inputfield">
                <label className="mailaddress">Email Address</label>
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
                <label className="pass">Password</label>
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

          {/* Phone sign-in form */}
          {showPhoneSignIn && (
            <>
              <div className="inputfield">
                <label className="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1234567890"
                  required
                />
              </div>
            </>
          )}

          {error && <div className="error">{error}</div>}

          {/* Login Button */}
          <div className="login-button">
            <button type="button" onClick={handleLoginClick} disabled={isLoading}>
              Login
            </button>
          </div>

          {/* OTP Verification */}
          {verificationId && (
            <div className="inputfield">
              <label className="otp">OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                required
              />
              <button type="button" onClick={handleVerifyOtpClick} disabled={isLoading}>
                Verify OTP
              </button>
            </div>
          )}

          <div className="kai"></div>
          <div className="addition">
            <Link href="forgot_pass">＞Forgot your Password?<br /></Link>
            <Link href="New-Account">＞New Account</Link>
          </div>
        </div>
      </div>
      <div className="last">
        <div className="last-line"></div>
      </div>

      {/* ReCAPTCHA container */}
      <div id="recaptcha-container"></div>
    </>
  );
}