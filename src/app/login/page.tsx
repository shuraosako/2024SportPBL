"use client";
import Image from "next/image"; 
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/home");
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

      <div className="logunder">
        <div className="log">
          <div>
            <div className="kai"></div>
            <label className="mailaddress">mailaddress</label>
            <input type="text" id="mailaddress" name="mailaddress" />
          </div>
          <div>
            <label className="pass">password</label>
            <input type="password" id="pass" name="password" />
          </div>
          <div className="kai"></div>
          <div className="login-button">
            <button onClick={handleLoginClick}>Login</button>
          </div>
          <div className="kai"></div>
          <div className="addition">
            <Link href="">＞Forgot your Password?<br/></Link>
            <Link href="New-Account">＞New Account</Link>
          </div>
        </div>
      </div>
      <div className="last">
        <div className="last-line"></div>
      </div>
    </>
  );
}