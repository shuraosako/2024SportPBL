"use client";

import { useState, useEffect } from "react";
import "./home.css";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../login/page";

// Define the Player type
type Player = {
  id: string;
  name: string;
  grade: string;
  height: number;
  weight: number;
};

export default function Home() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [searchName, setSearchName] = useState("");
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [searchGrade, setSearchGrade] = useState("");

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const playerCollection = collection(db, "players");
        const playerSnapshot = await getDocs(playerCollection);
        const playerList = playerSnapshot.docs.map(doc => ({
          id: doc.id,  // Include document ID
          ...doc.data()
        })) as Player[];

        const uniqueNames = Array.from(new Set(playerList.map(player => player.name)));
        const uniqueGrades = Array.from(new Set(playerList.map(player => player.grade)));

        setPlayers(playerList);
        setNames(uniqueNames);
        setGrades(uniqueGrades);
        setFilteredPlayers(playerList);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };

    fetchPlayers();
  }, []);

  const handleFilter = () => {
    let filtered = players;

    if (searchName) {
      filtered = filtered.filter(player => player.name === searchName);
    }
    if (searchGrade) {
      filtered = filtered.filter(player => player.grade === searchGrade);
    }

    setFilteredPlayers(filtered);
  };

  const handleNameInputChange = (input: string) => {
    setSearchName(input);

    if (input) {
      const suggestions = names.filter(name =>
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

  const handleLoginClick = () => {
    router.push("/create_player");
  };

  return (
    <>
      <header>
        <ul className="header-container">
          <li className="logo">SportsPBL</li>
          <li className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
            <Link href="">Analysis</Link>
            <div className="kai"></div>
            <Link href="/profile">Profile</Link>
            <div className="kai"></div>
            <Link href="">Setting</Link>
            <div className="kai"></div>
            <Link href="">Rapsodo</Link>
          </div>
        </div>

        <div className="RightContenthome">
          <div className="dropdown-container">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select a date"
              className="dropdown-item"
            />

            {/* Name Autocomplete Search */}
            <div className="name-autocomplete">
              <input
                type="text"
                value={searchName}
                onChange={(e) => handleNameInputChange(e.target.value)}
                placeholder="Type to search names"
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

            {/* Grade Filter */}
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

            <button type="button" onClick={handleFilter}>Filter</button>
            <button type="button" onClick={handleLoginClick}>+ New Player</button>
          </div>

          {/* Display Player Boxes */}
          <div className="player-cards-container">
              {filteredPlayers.map((player) => (
                <Link key={player.id} href={`/player/${player.id}`} className="player-card">
                  <h3>{player.name}</h3>
                  <p>Grade: {player.grade}</p>
                  <p>Height: {player.height} cm</p>
                  <p>Weight: {player.weight} kg</p>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
