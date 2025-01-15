"use client";
// change

import { useState, useEffect } from "react";
import "./home.css";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../login/page";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

// Define the Player type with imageURL and creationDate
type Player = {
  id: string;
  name: string;
  grade: string;
  height: number;
  weight: number;
  imageURL?: string;
  creationDate?: { seconds: number; nanoseconds: number }; // Firestore timestamp format
};

export default function Home() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [searchName, setSearchName] = useState("");
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [searchGrade, setSearchGrade] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false); // For profile pop-up
  const [profileImage, setProfileImage] = useState<string | null>(null); // User's profile image
  const [userName, setUserName] = useState<string | null>(null); // User's name or email

  // Fetch players from Firestore
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const playerCollection = collection(db, "players");
        const playerSnapshot = await getDocs(playerCollection);
        const playerList = playerSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Player[];

        const uniqueNames = Array.from(new Set(playerList.map((player) => player.name)));
        const uniqueGrades = Array.from(new Set(playerList.map((player) => player.grade)));

        setPlayers(playerList);
        setFilteredPlayers(playerList);
        setNames(uniqueNames);
        setGrades(uniqueGrades);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };

    fetchPlayers();
  }, []);

  // Fetch the logged-in user's profile photo
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User UID: ", user.uid); // Debugging
  
        try {
          const userDocRef = doc(db, "users", user.uid); // Path to Firestore document
          const userDoc = await getDoc(userDocRef);
  
          if (userDoc.exists()) {
            const data = userDoc.data();
            console.log("User Document Data: ", data);
  
            // Fetch and set the username if available, fallback to email otherwise
            const username = data?.username || user.email; 
            setUserName(username);
  
            // Fetch profile image
            const profileImageUrl = data?.profileImageUrl || null;
            setProfileImage(profileImageUrl);
          } else {
            console.log("User document does not exist.");
            setUserName(user.email); // Fallback to email
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserName(user.email); // Fallback to email
        }
      } else {
        router.push("/login"); // Redirect to login if not authenticated
      }
    });
  }, [router]);
  

  const formatCreationDate = (timestamp?: { seconds: number; nanoseconds: number }) => {
    return timestamp
      ? new Date(timestamp.seconds * 1000).toLocaleDateString("en-GB") // Format as DD/MM/YYYY
      : "Unknown date";
  };

  const handleFilter = () => {
    let filtered = players;

    if (searchName) {
      filtered = filtered.filter((player) => player.name.toLowerCase().includes(searchName.toLowerCase()));
    }

    if (searchGrade) {
      filtered = filtered.filter((player) => player.grade === searchGrade);
    }

    if (selectedDate) {
      const selectedDateString = selectedDate.toLocaleDateString("en-GB");
      filtered = filtered.filter((player) => {
        if (player.creationDate) {
          const creationDate = new Date(player.creationDate.seconds * 1000).toLocaleDateString("en-GB");
          return creationDate === selectedDateString;
        }
        return false;
      });
    }

    setFilteredPlayers(filtered);
  };

  const handleNameInputChange = (input: string) => {
    setSearchName(input);

    if (input) {
      const suggestions = names.filter((name) =>
        name.toLowerCase().includes(input.toLowerCase())
      );
      setNameSuggestions(suggestions);
    } else {
      setNameSuggestions([]);
    }
  };

  const handleNameSelect = (name: string) => {
    setSearchName(name);
    setNameSuggestions([]);
  };

  const handleAddNewPlayer = () => {
    router.push("/create_player");
  };

  const toggleProfilePopup = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const navigateToProfile = () => {
    router.push("/profile");
  };

  return (
    <>
      <header>
        <div className="header-container">
          <div className="logo">SportsPBL</div>
          <div className="header-right">
            <li className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              &#9776;
            </li>
            {/* Profile Section */}
            <li className="profile-section" onClick={toggleProfilePopup}>
              <div className="profile-info">
                <img
                  src={profileImage || "/default-profile.png"} // Default profile image if not available
                  alt="Profile"
                  className="profile-image"
                />
                <span className="username">{userName || "Guest"}</span> {/* Show username */}
              </div>
              {isProfileOpen && (
                <div className="profile-popup">
                  <p>{userName}</p>
                  <button onClick={navigateToProfile}>Profile</button>
                  <button onClick={() => router.push("/login")}>Logout</button>
                </div>
              )}
            </li>
            <li><Link href="/login">LOGIN</Link></li>
            <li><Link href="http://localhost:3000">TOP</Link></li>
            <li><a href="#">Setting</a></li>
          </div>
        </div>
      </header>
      <div className="header-underline"></div>

      <div className="main-content">
        <div className={`LeftSelection ${isMenuOpen ? "open" : ""}`}>
          <div className="Selection">
            <Link href="/home">Home</Link>
            <div className="kai"></div>
            <Link href="/analysis">Analysis</Link>
            <div className="kai"></div>
            <Link href="/profile">Profile</Link>
            <div className="kai"></div>
            <Link href="">Settings</Link>
            <div className="kai"></div>
            <Link href="">Rapsodo</Link>
            <div className="kai"></div>
            <Link href="/home">Home</Link>
          </div>
        </div>

        <div className="RightContenthome">
          {/* Filters */}
          <div className="dropdown-container">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select a date"
              className="dropdown-item"
            />

            <div className="name-autocomplete">
              <input
                type="text"
                value={searchName}
                onChange={(e) => handleNameInputChange(e.target.value)}
                placeholder="Search by name"
                className="dropdown-item"
              />
              {nameSuggestions.length > 0 && (
                <ul className="suggestions">
                  {nameSuggestions.map((suggestion, index) => (
                    <li key={index} onClick={() => handleNameSelect(suggestion)}>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <select
              value={searchGrade}
              onChange={(e) => setSearchGrade(e.target.value)}
              className="dropdown-item"
            >
              <option value="">All Grades</option>
              {grades.map((grade, index) => (
                <option key={index} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
            <div className="filter_button">
            <button onClick={handleFilter}>Filter</button>
            </div>
            <div className="new_player">
            <button onClick={handleAddNewPlayer}>New Player</button>
            </div>
          </div>

          {/* Player Cards */}
          <div className="player-cards-container">
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player) => (
                <Link key={player.id} href={`/player/${player.id}`} className="player-card">
                  {player.imageURL && (
                    <img src={player.imageURL} alt={`${player.name}'s profile`} className="player-photo" />
                  )}
                  <h3>{player.name}</h3>
                  <p>Grade: {player.grade}</p>
                  <p>Height: {player.height} cm</p>
                  <p>Weight: {player.weight} kg</p>
                  <p>Joined: {formatCreationDate(player.creationDate)}</p>
                </Link>
              ))
            ) : (
              <p>No players found. Adjust your filters or add a new player.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
