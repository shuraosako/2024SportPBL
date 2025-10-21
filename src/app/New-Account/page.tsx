"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { setDoc, doc } from "firebase/firestore";
import { auth, storage, db } from "@/lib/firebase";
import styles from './newaccount.module.css';

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
        <div className="logo">SportsPBL</div>
        <div className="header-right">
          <ul>
            <li><Link href="/login">LOGIN</Link></li>
            <li><Link href="/">TOP</Link></li>
            <li><Link href="/setting">Settings</Link></li>
          </ul>
        </div>
      </header>

      <div className={styles.newunder}>
        <div className={styles.new}>
          <h2 style={{ marginBottom: '10px', color: '#333' }}>新規アカウント作成</h2>

          <div className={styles.profileUpload}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              id="profileImageInput"
            />
            <label htmlFor="profileImageInput" className={styles.profileImageLabel}>
              <div className={styles.imagePreview}>
                <div className={styles.imagePreviewContent}>
                  {profileImage ? (
                    <Image
                      src={URL.createObjectURL(profileImage)}
                      alt="Profile Picture"
                      fill
                      style={{ objectFit: 'cover', borderRadius: '50%' }}
                    />
                  ) : (
                    <span className={styles.uploadText}>画像を選択</span>
                  )}
                </div>
              </div>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label>メールアドレス</label>
            <input
              type="email"
              id="mailaddress"
              name="mailaddress"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>パスワード</label>
            <input
              type="password"
              id="pass"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8文字以上"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>パスワード確認</label>
            <input
              type="password"
              id="checkpass"
              name="checkpassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="もう一度パスワードを入力"
              required
            />
          </div>

          <button
            type="submit"
            onClick={handleRegister}
            className={styles.createButton}
          >
            アカウント作成
          </button>

          {error && <div className={styles.error}>{error}</div>}
        </div>
      </div>

      <div className={styles.last}>
        <div className={styles.lastLine}></div>
      </div>
    </>
  );
}