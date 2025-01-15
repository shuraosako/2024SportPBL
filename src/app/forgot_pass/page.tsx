"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="container">
      <h1>password reset</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">mail address</label>
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
  );
}