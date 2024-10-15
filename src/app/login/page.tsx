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
          <div className="inputfield">
            <div className="kai"></div>
            <label className="mailaddress">EmailAddress</label>
            <input type="logintext" id="mailaddress" name="mailaddress" />
          </div>
          <div className="inputfield">
            <label className="pass">password</label>
            <input type="loginpassword" id="pass" name="password" />
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