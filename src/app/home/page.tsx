"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Home() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [names, setNames] = useState<string[]>(["John", "Jane", "Doe", "Mary", "James", "Lucy"]);
  const [filteredNames, setFilteredNames] = useState<string[]>(names);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("2024");

  const handleLoginClick = async () => {
    router.push("/create_player");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
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

        <div className="RightContenthome">
          <div className="dropdown-container">
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select a date"
              className="dropdown-item"
            />
            
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
          </div>
        </div>
      </div>
    </>
  );
}