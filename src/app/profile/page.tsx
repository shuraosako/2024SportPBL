"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getAuth, updatePassword, updatePhoneNumber, User } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider } from "firebase/auth";
import Navigation from "@/components/Navigation";
import "./profile.css";
import "../home/home.css";

export default function ProfilePage({ params }: { params: { uid: string } }) {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  const [newPassword, setNewPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageURL, setCurrentImageURL] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const fetchCurrentProfileImage = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData?.imageURL) {
              setCurrentImageURL(userData.imageURL);
            }
          }
        } catch (error) {
          console.error("Error fetching current profile image:", error);
        }
      }
    };
    fetchCurrentProfileImage();
  }, [user]);

  const toggleProfilePopup = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handlePhoneNumberSignIn = async () => {
    if (!phoneNumber) {
      alert("Please enter your phone number.");
      return;
    }

    try {
      const recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );
      recaptchaVerifier.render();

      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      setVerificationId(confirmationResult.verificationId);
      alert("OTP sent to your phone number.");
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    if (!verificationId || !otp) {
      alert("Please enter the OTP.");
      return;
    }

    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      if (user) {
        await updatePhoneNumber(user, credential);
        alert("Phone number updated successfully.");
      } else {
        alert("User not logged in.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Failed to verify OTP. Please try again.");
    }
  };

  const handleSaveChanges = async () => {
    if (!user) {
      alert("User not logged in.");
      return;
    }

    setIsLoading(true);
    const updates: any = {};
    const imageRef = ref(storage, `profile-images/${user.uid}`);

    try {
      if (newPassword) {
        if (newPassword.length < 6) {
          alert("Password must be at least 6 characters long.");
          setIsLoading(false);
          return;
        }

        await updatePassword(user, newPassword);
        alert("Password updated successfully.");
      }

      if (newUsername) {
        updates.username = newUsername;
      }

      if (profileImage) {
        if (!profileImage.type.startsWith('image/')) {
          alert("Invalid file type. Please upload an image.");
          setIsLoading(false);
          return;
        }

        await uploadBytes(imageRef, profileImage);
        const imageURL = await getDownloadURL(imageRef);
        updates.imageURL = imageURL;
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, "users", user.uid), updates);
        alert("Profile updated successfully.");
      } else {
        alert("No changes to save.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProfileImage(file);
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewImage(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    router.push(path);
  };

  return (
    <>
      <Navigation showProfile={true} showHamburger={true} />

      <div className="main-content">
        <div className="RightContent">
          <div className="profile-page">
            <h1 className="profile-title">Profile Page</h1>

            {isLoading && <div className="loading-spinner">Saving...</div>}

            <div className="profile-section">
              {currentImageURL && (
                <div className="profile-current-image">
                  <Image 
                    src={currentImageURL} 
                    alt="Current Profile" 
                    className="profile-image-preview" 
                    width={200} 
                    height={200}
                  />
                </div>
              )}
            </div>

            <div className="profile-section">
              <label className="profile-label">Phone Number:</label>
              <input
                type="tel"
                className="profile-input"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
              />
              <button className="profile-button" onClick={handlePhoneNumberSignIn}>
                Send OTP
              </button>
            </div>

            {verificationId && (
              <div className="profile-section">
                <label className="profile-label">OTP:</label>
                <input
                  type="text"
                  className="profile-input"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                />
                <button className="profile-button" onClick={handleVerifyOtp}>
                  Verify OTP
                </button>
              </div>
            )}

            <div className="profile-section">
              <label className="profile-label">New Password:</label>
              <input
                type="password"
                className="profile-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="profile-section">
              <label className="profile-label">New Username:</label>
              <input
                type="text"
                className="profile-input"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>

            <div className="profile-section">
              <label className="profile-label">Upload New Profile Photo:</label>
              {previewImage && (
                <Image
                  src={previewImage}
                  alt="Profile Preview"
                  className="profile-image-preview"
                  width={200}
                  height={200}
                />
              )}
              <input
                type="file"
                accept="image/*"
                className="profile-input-file"
                onChange={handleImageChange}
              />
            </div>

            <div className="profile-section">
              <button className="profile-button" onClick={handleSaveChanges} disabled={isLoading}>
                Save Changes
              </button>
            </div>

            <div id="recaptcha-container"></div>
          </div>
        </div>
      </div>
    </>
  );
}