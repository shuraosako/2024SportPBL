"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
      
      <div className="home-under">
        {isMenuOpen && (
          <div className="LeftSelection">
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
        )}
      </div>

      <style jsx>{`
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          list-style-type: none;
          padding: 0;
        }

        .logo {
          flex: 1;
        }

        .hamburger {
          cursor: pointer;
          font-size: 24px;
          padding: 10px;
        }

        .header-right {
          display: flex;
          gap: 20px;
        }

        .LeftSelection {
          // Add your styles for the LeftSelection here
        }

        .header-right li {
          list-style: none;
        }
      `}</style>
    </>
  );
}
