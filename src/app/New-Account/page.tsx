"use client";
import Image from "next/image"; 
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/login");
  };

  return (
    
    <><header>
    <ul>
      <li className="logo">SportsPBL</li>
      <div className="header-right">
        <li><Link href="/login">LOGIN</Link></li>
        <li><Link href="http://localhost:3000">TOP</Link></li>
        <li><a href="#">設定</a></li>
      </div>
    </ul>
  </header>

    <div className="newunder">
    <div className="new">
<div>
    <div className="kai"></div>
  <label className="username">username</label>
  <input type="text" id="username" name="username" />
</div>
<div>
  <label className="mailaddress">mailaddress</label>
  <input type="text" id="mailaddress" name="mailaddress" />
</div>
<div>
  <label className="phonenumber">phonenumber</label>
  <input type="text" id="phonenumber" name="phonenumber" />
</div>
<div>
  <label className="pass">password </label>
  <input type="password" id="pass" name="password" />
</div>
<div>
  <label className="checkpass">checkpassword </label>
  <input type="password" id="checkpass" name="checkpassword" />
</div>
<div className="kai"></div>
<div className="login-button">
            <button onClick={handleLoginClick}>newaccount</button>
          </div>

    </div>
    </div>
    <div className="last">
      <div className="last-line"></div>
      </div>
  </>   
  );
}