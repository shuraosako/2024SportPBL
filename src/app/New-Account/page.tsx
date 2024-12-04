"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, setDoc, doc } from "firebase/firestore";

// Your Firebase configuration
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
const auth = getAuth();
const storage = getStorage();
const db = getFirestore();

export default function Login() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<File | null>(null); // Use File type
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Handle image upload
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
    }
  };

  // Upload image to Firebase Storage
  const uploadImage = async (file: File, userId: string) => {
    const imageRef = ref(storage, `profile-images/${userId}`);
    await uploadBytes(imageRef, file);
    return getDownloadURL(imageRef); // This will return the public URL of the uploaded image
  };

  // Handle registration
  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let imageUrl = "";
      if (profileImage) {
        imageUrl = await uploadImage(profileImage, user.uid); // Upload image if provided
      }

      // Save user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        profileImageUrl: imageUrl, // Save the image URL
      });

      alert(`Account created successfully for ${user.email}`);
      router.push("/login");
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <>
      <header>
        <ul>
          <li className="logo">SportsPBL</li>
          <div className="header-right">
            <li><Link href="/login">LOGIN</Link></li>
            <li><Link href="/">TOP</Link></li>
            <li><a href="#">Settings</a></li>
          </div>
        </ul>
      </header>

      <div className="newunder">
        <div className="new">
          <div className="profile-upload" style={{ textAlign: 'center', margin: '10px 0' }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              style={{ display: 'none' }} 
              id="profileImageInput"
            />
            <label htmlFor="profileImageInput" style={{ cursor: 'pointer' }}>
              <div style={{
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                overflow: 'hidden',
                border: '2px dashed #ccc', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                position: 'relative'
              }}>
                {profileImage ? (
                  <Image 
                    src={URL.createObjectURL(profileImage)} 
                    alt="Profile Picture" 
                    layout="fill" 
                    objectFit="cover"
                    style={{ borderRadius: '50%' }}
                  />
                ) : (
                  <span style={{ textAlign: 'center' }}>Upload Image</span>
                )}
              </div>
            </label>
          </div>

          {/* Registration Form */}
          <div>
            <label>Email Address</label>
            <input 
              type="text" 
              id="mailaddress" 
              name="mailaddress" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label>Password</label>
            <input 
              type="password" 
              id="pass" 
              name="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label>Confirm Password</label>
            <input 
              type="password" 
              id="checkpass" 
              name="checkpassword" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="kai"></div>
          <div className="login-button">
            <button id="submit" type="submit" onClick={handleRegister}>Create Account</button>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      </div>
      <div className="last">
        <div className="last-line"></div>
      </div>
    </>
  );
}