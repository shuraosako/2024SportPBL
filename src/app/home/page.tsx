import Image from "next/image"; 
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {

 
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
      <div className="home-under">
      <div className="home-rightunder">
      <div className="calendar-container">
        <input type="date" />
      </div>
      </div>
      <div className="LeftSelection">
        <div className="Selection">
          <Link href="">Analysis<br/></Link>
          <div className="kai"></div>
          <Link href="/profile">Profile<br/></Link>
          <div className="kai"></div>
          <Link href="">Setting<br/></Link>
          <div className="kai"></div>
          <Link href="">Rapsodo<br/></Link>
        </div>
      </div>
     </div>
    </>
  );
}