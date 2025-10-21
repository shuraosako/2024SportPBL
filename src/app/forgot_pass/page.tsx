"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./forgot_pass.css";

export default function ForgotPassword() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("名前:", name);
    console.log("メールアドレス:", email);
    alert("パスワードリセットリンクが送信されました！");
    router.push("/verify_code");

    setName("");
    setEmail("");
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
        <h1>パスワードリセット</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">お名前</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit">送信</button>
        </form>
      </div>
    </>
  );
}