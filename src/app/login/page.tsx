"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithEmailAndPassword, PhoneAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth,db } from "@/lib/firebase";

export default function Login() {
  const router = useRouter();
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
          <div className="sign-in-toggle">
            <button type="button" onClick={() => setShowPhoneSignIn(false)}>
              Email Sign In
            </button>
            <button className="button phone_button" onClick={() => setShowPhoneSignIn(true)}>
              Phone Sign In
            </button>
          </div>

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

          <div className="login-button">
            <button type="button" onClick={handleLoginClick} disabled={isLoading}>
              Login
            </button>
          </div>

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

      <div id="recaptcha-container"></div>
    </>
  );
}