"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./verify_code.css"; // CSSをインポート

export default function VerifyCode() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`入力されたコード: ${code}`);
    router.push("/NewPass");
  };

  return (
    <div className="container">
      <h1>確認コード入力</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="code">code</label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <button type="submit">送信</button>
      </form>
    </div>
  );
}