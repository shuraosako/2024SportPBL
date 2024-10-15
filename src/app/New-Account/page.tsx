"use client";
import Image from "next/image"; 
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null); // State to store the uploaded image

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Check if e.target is not null
        if (e.target && typeof e.target.result === "string") {
          setProfileImage(e.target.result); // Set the uploaded image URL
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoginClick = () => {
    router.push("/login");
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
      
      <div className="newunder">
        <div className="new">
        <div className="profile-upload" style={{ textAlign: 'center', margin: '20px 0' }}>
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
            overflow: 'hidden', // Ensures the image stays within the circular shape
            border: '2px dashed #ccc', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            position: 'relative' // Position relative for the Image component
          }}>
            {profileImage ? (
              <Image 
                src={profileImage} 
                alt="Profile Picture" 
                layout="fill" // Use fill layout
                objectFit="cover" // Ensures the image covers the container without distortion
                style={{ borderRadius: '50%' }} // Maintain circular shape
              />
            ) : (
              <span style={{ textAlign: 'center' }}>Upload Image</span>
            )}
          </div>
        </label>
      </div>

          <div>
            <label className="username">Username</label>
            <input type="text" id="username" name="username" />
          </div>
          <div>
            <label className="mailaddress">Email Address</label>
            <input type="text" id="mailaddress" name="mailaddress" />
          </div>
          <div>
            <label className="phonenumber">Phone Number</label>
            <input type="text" id="phonenumber" name="phonenumber" />
          </div>
          <div>
            <label className="pass">Password</label>
            <input type="password" id="pass" name="password" />
          </div>
          <div>
            <label className="checkpass">Confirm Password</label>
            <input type="password" id="checkpass" name="checkpassword" />
          </div>
          <div className="kai"></div>
          <div className="login-button">
            <button onClick={handleLoginClick}>Create Account</button>
          </div>
        </div>
      </div>
      <div className="last">
        <div className="last-line"></div>
      </div>
    </>
  );
}