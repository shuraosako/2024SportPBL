"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../login/page";
import "./profile.css";


export default function ProfilePage({ params }: { params: { uid: string } }) {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;
  const [newPassword, setNewPassword] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handlePasswordChange = async () => {
    if (user && newPassword) {
      try {
        await updatePassword(user, newPassword);
        alert("Password updated successfully");
      } catch (error) {
        console.error("Error updating password:", error);
      }
    }
  };

  const handleImageUpload = async () => {
    if (profileImage && user) {
      const imageRef = ref(storage, `profile-images/${user.uid}`);
      try {
        await uploadBytes(imageRef, profileImage);
        const imageURL = await getDownloadURL(imageRef);

        // Update user profile in Firestore
        await updateDoc(doc(db, "users", user.uid), { imageURL });
        alert("Profile photo updated successfully");
      } catch (error) {
        console.error("Error uploading image:", error);
      }
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

  return (
    <div className="profile-page">
      <h1 className="profile-title">Profile Page</h1>
      <div className="profile-section">
        <label className="profile-label">New Password:</label>
        <input
          type="password"
          className="profile-input"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button className="profile-button" onClick={handlePasswordChange}>
          Update Password
        </button>
      </div>
      <div className="profile-section">
        <label className="profile-label">Upload New Profile Photo:</label>
        {previewImage && (
          <img
            src={previewImage}
            alt="Profile Preview"
            className="profile-image-preview"
          />
        )}
        <input
          type="file"
          accept="image/*"
          className="profile-input-file"
          onChange={handleImageChange}
        />
        <button className="profile-button" onClick={handleImageUpload}>
          Upload Photo
        </button>
      </div>
    </div>
  );
}