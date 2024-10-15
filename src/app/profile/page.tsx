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

      <div>
        PROFILE VIEWING
      </div>
  </>);}