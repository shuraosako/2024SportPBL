
"use client";

import Image from "next/image"; 
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const handleLoginClick = () => {
    router.push("/sinki");
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
      <div className="header-underline"></div>
      <div className="sinkiunder">
    <div className="sinki">
<div>
    <div className="kai"></div>
  <label className="name">Name</label>
  <input type="text" id="Name" name="Name" />
</div>
<div className="GHW">
<div>
  <label className="Grade">Grade</label>
  <input type="text" id="Grade" name="Grade" />
</div>
<div>
  <label className="Height">Height</label>
  <input type="text" id="Height" name="Height" />
</div>
<div>
  <label className="Weight">Weight</label>
  <input type="text" id="Weight" name="Weight" />
</div>
</div>
<div className="kai"></div>
<div className="login-button">
            <button onClick={handleLoginClick}>registration</button>
          </div>

    </div>
    </div>
    </>
  );
}