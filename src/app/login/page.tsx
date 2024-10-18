"use client";
import Image from "next/image"; 
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyCoq3lwqjKG1Ja9OQMlmQyOsBFot_fEMXU",
  authDomain: "sports-pbl.firebaseapp.com",
  projectId: "sports-pbl",
  storageBucket: "sports-pbl.appspot.com",
  messagingSenderId: "182306703534",
  appId: "1:182306703534:web:86b8757669edf89f24453f",
  measurementId: "G-FYNN6VTDMJ"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth();

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState(""); // State for email input
  const [password, setPassword] = useState(""); // State for password input
  const [error, setError] = useState(""); // State for error messages

  const handleLoginClick = async () => {
    try {
      // Attempt to sign in
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/home"); // Redirect to the home page on successful login
    } catch (err) {
      setError("Failed to log in. Please check your credentials."); // Set error message
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
            <li><a href="#">設定</a></li>
          </div>
        </ul>
      </header>

      <div className="logunder">
        <div className="log">
          <div className="inputfield">
            <div className="kai"></div>
            <label className="mailaddress">Email Address</label>
            <input 
              type="email" 
              id="mailaddress" 
              name="mailaddress" 
              value={email} // Controlled input for email
              onChange={(e) => setEmail(e.target.value)} // Update state on change
              required
            />
          </div>
          <div className="inputfield">
            <label className="pass">Password</label>
            <input 
              type="password" 
              id="pass" 
              name="password" 
              value={password} // Controlled input for password
              onChange={(e) => setPassword(e.target.value)} // Update state on change
              required
            />
          </div>
          {error && <div className="error">{error}</div>} {/* Display error message */}
          <div className="kai"></div>
          <div className="login-button">
            <button type="button" onClick={handleLoginClick}>Login</button>
          </div>
          <div className="kai"></div>
          <div className="addition">
            <Link href="">＞Forgot your Password?<br/></Link>
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
