"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import the CSS for the date picker

export default function Home() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // State to handle the selected date
  const [names, setNames] = useState(["John", "Jane", "Doe", "Mary", "James", "Lucy"]); // Dynamic list of names
  const [filteredNames, setFilteredNames] = useState(names); // Filtered names for search
  const [searchTerm, setSearchTerm] = useState(""); // State for searching names
  const [selectedYear, setSelectedYear] = useState("2024"); // State to handle the selected year

  const handleLoginClick = async () => {
    router.push("/create_player");
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Filter names based on search term
  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);
    setFilteredNames(
      names.filter((name) =>
        name.toLowerCase().includes(searchValue)
      )
    );
    
  };

  return (
    <>
      <header>
        <ul className="header-container">
          <li className="logo">SportsPBL</li>
          {/* Hamburger Icon */}
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

      {/* Main content area with LeftSelection and RightContent */}
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

        {/* RightContent with Date, Searchable Name Dropdown, and Year dropdown */}
        <div className="RightContenthome">
          <div className="dropdown-container">
            {/* Date Picker */}
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select a date"
              className="dropdown-item"
            />
            
            {/* Searchable Name Dropdown */}
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
                onChange={(e) => setSearchTerm(e.target.value)}
              >
                <option value="">Select a name</option>
                {filteredNames.map((name, index) => (
                  <option key={index} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Dropdown */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="dropdown-item"
            >
              <option value="Year 1">Year 1</option>
              <option value="Year 2">Year 2</option>
              <option value="Year 3">Year 3</option>
              <option value="Year 4">Year 4</option>
              {/* Add more years as needed */}
            </select>

            <button type="button"onClick= {handleLoginClick}>+ New Player</button>
          </div>
        </div>
      </div>

      
    </>
  );
}
