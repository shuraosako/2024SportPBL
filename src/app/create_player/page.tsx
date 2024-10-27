"use client";

import { useState } from "react";
import "./create_player.css"
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "../login/page"; // Import Firebase config
import { collection, addDoc } from "firebase/firestore";

export default function Homepage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [error, setError] = useState(""); // State for error messages
  const [playerName, setPlayerName] = useState("");
  const [grade, setGrade] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  // Toggle for sidebar menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Submit player data to Firebase
  const handleAddPlayer = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    console.log("Adding player with details:", { playerName, grade, height, weight });

    // Validate the input fields
    if (!playerName || !grade || !height || !weight) {
        setError("All fields are required.");
        return;
    }

    try {
        // Attempt to add the player to Firestore
        await addDoc(collection(db, "players"), {
            name: playerName,
            grade: grade,
            height: height,
            weight: weight,
        });
        console.log("Player added successfully!"); // Log success

        // Clear fields and reset error state if necessary
        setPlayerName("");
        setGrade("");
        setHeight("");
        setWeight("");
        setError(""); // Clear previous errors
    } catch (err) {
        console.error("Error adding player:", err); // Log the error
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

              <button onClick={handleAddPlayer}>Add Player</button>
          </form>
        </div>
      </div>
    </>
  );
}
