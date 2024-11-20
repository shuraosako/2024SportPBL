"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
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
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
const auth = getAuth();

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState(""); // State for email input
  const [password, setPassword] = useState(""); // State for password input
  const [error, setError] = useState(""); // State for error messages

  const handleLoginClick = async () => {
    setError(""); // Clear previous errors
    try {
      // Authenticate user with Firebase
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect to the homepage after successful login
      router.push("/home");
    } catch (err) {
      // Show error message if login fails
      setError("Failed to log in. Please check your credentials.");
      console.error("Login error:", err);
    }
  };

  return (
    <>
      <header>
        <ul>
          <li className="logo">SportsPBL</li>
          <div className="header-right">
            <li><Link href="/login">LOGIN</Link></li>
            <li><Link href="http://localhost:3000">TOP</Link></li>
            <li><a href="#">Settings</a></li>
          </div>
        </ul>
      </header>

      <div className="logunder">
        <div className="logframe">
        <div className="log">
          <div className="inputfield">
          
            <label className="mailaddress">Email Address</label>
            <input
              type="email"
              id="mailaddress"
              name="mailaddress"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Update email state on input change
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
              onChange={(e) => setPassword(e.target.value)} // Update password state on input change
              required
            />
          </div>
          {error && <div className="error">{error}</div>} {/* Display error message */}
          <div className="kai"></div>
          <div className="login-button">
            <button type="button" onClick={handleLoginClick}>Login</button> {/* Redirect only after click */}
          </div>
          </div>
          <div className="kai"></div>
          <div className="addition">
            <Link href="">＞Forgot your Password?<br /></Link>
            <Link href="New-Account">＞New Account</Link>
          </div>
        </div>
      </div>
      <div className="last">
        <div className="last-line"></div>
      </div>
    </>
  );
}
