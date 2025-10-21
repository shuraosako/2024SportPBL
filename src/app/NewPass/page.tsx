"use client";

import { useState } from "react";
import Link from "next/link";
import "./NewPass.css";

export default function NewPass() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("パスワードが一致しません");
      return;
    }
    alert("パスワードが更新されました");
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
        <h1>新しいパスワードを登録</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password">新しいパスワード</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8文字以上"
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword">パスワード確認</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="もう一度入力"
              required
            />
          </div>
          <button type="submit">登録</button>
        </form>
      </div>
    </>
  );
}