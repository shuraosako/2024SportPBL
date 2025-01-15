"use client";

import { useState } from "react";
import "./NewPass.css"; // CSSをインポート

export default function NewPass() {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`入力された新しいパスワード: ${password}`);
  };

  return (
    <div className="container">
      <h1>New password regist</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password">new password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">登録</button>
      </form>
    </div>
  );
}