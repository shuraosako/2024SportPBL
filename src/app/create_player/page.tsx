"use client";

import { useState } from "react";
import "./create_player.css";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db, storage } from "../login/page"; // Import Firebase storage and Firestore
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Firebase storage functions
import Image from "next/image";

export default function Homepage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [error, setError] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [grade, setGrade] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(""); // New state for the selected date
  const [image, setImage] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle image file selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImage(file);

      // Preview image
      const reader = new FileReader();
      reader.onload = () => {
        setImageURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPlayer = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!playerName || !grade || !height || !weight || !date || !image) {
      setError("All fields, including profile photo and date, are required.");
      return;
    }

    try {
      let imageDownloadURL = "";

      // Upload image to Firebase Storage
      if (image) {
        const imageRef = ref(storage, `player-images/${image.name}`);
        await uploadBytes(imageRef, image);
        imageDownloadURL = await getDownloadURL(imageRef);
      }

      // Add player data to Firestore
      await addDoc(collection(db, "players"), {
        name: playerName,
        grade: grade,
        height: height,
        weight: weight,
        creationDate: date, // Store manually selected date
        imageURL: imageDownloadURL, // Store image URL
      });

      // Clear form fields and image preview
      setPlayerName("");
      setGrade("");
      setHeight("");
      setWeight("");
      setDate("");
      setImage(null);
      setImageURL(null);
      setError("");
    } catch (err) {
      console.error("Error adding player:", err);
      setError("Failed to add player.");
    }
  };

  return (
    <>
      <header>
        <ul className="header-container">
          <li className="logo">SportsPBL</li>
          <li className="hamburger" onClick={toggleMenu}>
            &#9776;
          </li>
          <div className="header-right">
            <li><Link href="/login">LOGIN</Link></li>
            <li><Link href="http://localhost:3000">TOP</Link></li>
            <li><a href="#">設定</a></li>
          </div>
        </ul>
      </header>
      <div className="header-underline"></div>

      <div className="main-content">
        <div className={`LeftSelection ${isMenuOpen ? "open" : ""}`}>
          <div className="Selection">
            <Link href="/home">Home</Link>
            <div className="kai"></div>
            <Link href="">Analysis<br/></Link>
            <div className="kai"></div>
            <Link href="/profile">Profile<br/></Link>
            <div className="kai"></div>
            <Link href="">Setting<br/></Link>
            <div className="kai"></div>
            <Link href="">Rapsodo<br/></Link>
          </div>
        </div>

        {/* Add Player Form */}
        <div className="add-player-form">
          <h2>Add New Player</h2>

          {/* Profile Image Preview */}
          {imageURL && (
            <div className="image-preview">
              <Image src={imageURL} alt="Profile Preview" width={100} height={100} className="profile-image" />
            </div>
          )}

          <form onSubmit={handleAddPlayer}>
            <label>Player's Name:</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              required
            />

            <label>Grade:</label>
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              required
            />

            <label>Height (cm):</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              required
            />

            <label>Weight (kg):</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />

            {/* Date Selection */}
            <label>Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            {/* Image Upload */}
            <label>Profile Photo:</label>
            <input type="file" accept="image/*" onChange={handleImageChange} required />

            <button type="submit">Add Player</button>
          </form>
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>

    </>
  );
}
