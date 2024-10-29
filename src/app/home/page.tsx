"use client";

<<<<<<< HEAD
<<<<<<< HEAD
import "./home.css";
import { useState, useEffect } from "react";
=======
import { useState, ChangeEvent } from "react";
>>>>>>> 201b7e8b233febf488471551f0373b177dbc5a47
=======
import { useState, ChangeEvent } from "react";
>>>>>>> 201b7e8b233febf488471551f0373b177dbc5a47
import { useRouter } from "next/navigation";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
<<<<<<< HEAD
<<<<<<< HEAD
import { collection, getDocs } from "firebase/firestore";
import { db } from "../login/page";

// Define the Player type
type Player = {
  name: string;
  grade: string;
  height: number;
  weight: number;
};

export default function Home() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); 
  const [players, setPlayers] = useState<Player[]>([]); // All players with Player type
  const [names, setNames] = useState<string[]>([]); // Unique names for dropdown
  const [grades, setGrades] = useState<string[]>([]); // Unique grades for dropdown
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]); // Players after filtering
  const [searchName, setSearchName] = useState(""); 
  const [searchGrade, setSearchGrade] = useState(""); 

  useEffect(() => {
    // Fetch player data from Firebase
    const fetchPlayers = async () => {
      try {
        const playerCollection = collection(db, "players");
        const playerSnapshot = await getDocs(playerCollection);
        const playerList = playerSnapshot.docs.map(doc => doc.data() as Player); // Cast to Player type
=======

export default function Home() {
  const router = useRouter();
=======

export default function Home() {
  const router = useRouter();
>>>>>>> 201b7e8b233febf488471551f0373b177dbc5a47
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [names, setNames] = useState<string[]>(["John", "Jane", "Doe", "Mary", "James", "Lucy"]);
  const [filteredNames, setFilteredNames] = useState<string[]>(names);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("2024");

  const handleLoginClick = async () => {
    router.push("/create_player");
  };
<<<<<<< HEAD
>>>>>>> 201b7e8b233febf488471551f0373b177dbc5a47
=======
>>>>>>> 201b7e8b233febf488471551f0373b177dbc5a47

        // Populate unique names and grades for dropdowns
        const uniqueNames = Array.from(new Set(playerList.map(player => player.name)));
        const uniqueGrades = Array.from(new Set(playerList.map(player => player.grade)));

        setPlayers(playerList);
        setNames(uniqueNames);
        setGrades(uniqueGrades);
        setFilteredPlayers(playerList); // Initially show all players
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

<<<<<<< HEAD
<<<<<<< HEAD
  const handleLoginClick = () => {
    router.push("/create_player");
=======
=======
>>>>>>> 201b7e8b233febf488471551f0373b177dbc5a47
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);
    setFilteredNames(
      names.filter((name) =>
        name.toLowerCase().includes(searchValue)
      )
    );
<<<<<<< HEAD
>>>>>>> 201b7e8b233febf488471551f0373b177dbc5a47
=======
>>>>>>> 201b7e8b233febf488471551f0373b177dbc5a47
  };

  return (
    <>
      <header>
        <ul className="header-container">
<<<<<<< HEAD
<<<<<<< HEAD
          <li className="logo">SportsPBL</li>
          <li className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            &#9776;
          </li>
=======
=======
>>>>>>> 201b7e8b233febf488471551f0373b177dbc5a47
          <li className="hamburger" onClick={toggleMenu}>
            &#9776;
          </li>
          <li className="logo">SportsPBL</li>
<<<<<<< HEAD
>>>>>>> 201b7e8b233febf488471551f0373b177dbc5a47
=======
>>>>>>> 201b7e8b233febf488471551f0373b177dbc5a47
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
              onChange={(date: Date | null) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select a date"
              className="dropdown-item"
            />
<<<<<<< HEAD

            {/* Name Filter */}
            <select
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="dropdown-item"
            >
              <option value="">All Names</option>
              {names.map((name, index) => (
                <option key={index} value={name}>
                  {name}
                </option>
              ))}
            </select>

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
            {filteredPlayers.map((player, index) => (
              <div key={index} className="player-card">
                <h3>{player.name}</h3>
                <p>Grade: {player.grade}</p>
                <p>Height: {player.height} cm</p>
                <p>Weight: {player.weight} kg</p>
              </div>
            ))}
=======
            
            <div className="dropdown-item">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search names"
                className="search-input"
              />
              <select
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSearchTerm(e.target.value)}
              >
                <option value="">Select a name</option>
                {filteredNames.map((name, index) => (
                  <option key={index} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={selectedYear}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedYear(e.target.value)}
              className="dropdown-item"
            >
              <option value="Year 1">Year 1</option>
              <option value="Year 2">Year 2</option>
              <option value="Year 3">Year 3</option>
              <option value="Year 4">Year 4</option>
            </select>

            <button type="button" onClick={handleLoginClick}>+ New Player</button>
<<<<<<< HEAD
>>>>>>> 201b7e8b233febf488471551f0373b177dbc5a47
=======
>>>>>>> 201b7e8b233febf488471551f0373b177dbc5a47
          </div>
        </div>
      </div>
    </>
  );
}