"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./verify_code.css";

export default function VerifyCode() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`入力されたコード: ${code}`);
    router.push("/NewPass");
  };

  return (
    <>
      <header>
        <div className="logo">SportsPBL</div>
        <div className="header-right">
          <ul>
            <li><Link href="/login">LOGIN</Link></li>
            <li><Link href="/">TOP</Link></li>
            <li><Link href="/setting">Settings</Link></li>
          </ul>
        </div>
      </header>

      <div className="container">
        <h1>確認コード入力</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="code">確認コード</label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6桁のコードを入力"
              required
            />
          </div>
          <button type="submit">送信</button>
        </form>
      </div>
    </>
  );
}