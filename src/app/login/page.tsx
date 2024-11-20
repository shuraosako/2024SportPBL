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
  const [error, setError] = useState("");

  const handleLoginClick = async () => {
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/home");
    } catch (err) {
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
            {error && <div className="error">{error}</div>}
            <div className="kai"></div>
            <div className="login-button">
              <button type="button" onClick={handleLoginClick}>Login</button>
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

      <style jsx>{`
        header {
          background-color: #fff;
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }

        ul {
          list-style: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 0;
          padding: 0;
        }

        .logo {
          font-weight: bold;
          font-size: 1.2rem;
        }

        .header-right {
          display: flex;
          gap: 2rem;
        }

        .logunder {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 70px);
          background-color: #f5f5f5;
        }

        .logframe {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }

        .inputfield {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .error {
          color: red;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .kai {
          height: 1rem;
        }

        .login-button button {
          width: 100%;
          padding: 0.75rem;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .login-button button:hover {
          background-color: #0056b3;
        }

        .addition {
          margin-top: 1.5rem;
          text-align: center;
        }

        .addition a {
          color: #007bff;
          text-decoration: none;
          font-size: 0.875rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .addition a:hover {
          text-decoration: underline;
        }

        .last {
          margin-top: 2rem;
        }

        .last-line {
          border-top: 1px solid #eee;
        }
      `}</style>
    </>
  );
}