"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./../login/page";
import styles from "./AnalysisPage.module.css";

type UploadedRow = Record<string, any>;

export default function AnalysisPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(""); // Optional filter
  const [endDate, setEndDate] = useState<string>(""); // Optional filter
  const [playerData, setPlayerData] = useState<UploadedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch players on component mount
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const playerList = await getPlayers();
        console.log("Players List:", playerList); // Log to verify data
        setPlayers(playerList);
      } catch (err) {
        console.error("Error fetching players:", err);
        setError("Failed to load players.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const getPlayers = async () => {
    const playersRef = collection(db, "players");
    const snapshot = await getDocs(playersRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, type: "start" | "end") => {
    const value = e.target.value;
    if (type === "start") {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
  };

  const handleFetchData = async () => {
    if (!selectedPlayer) {
      setError("Please select a player.");
      return;
    }

    try {
      setLoading(true);
      const subcollectionRef = collection(db, "players", selectedPlayer, "csvData");
      const snapshot = await getDocs(subcollectionRef);

      if (snapshot.empty) {
        console.log("No documents found in the csvData subcollection.");
        setPlayerData([]);
      } else {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPlayerData(data);
      }
      setError("");
    } catch (err) {
      console.error("Error fetching player data:", err);
      setError("Failed to fetch player data.");
    } finally {
      setLoading(false);
    }
  };

  // Create consistent headers from all rows
  const headers = playerData.length
    ? Array.from(new Set(playerData.flatMap((row) => Object.keys(row))))
    : [];

  // Normalize rows to match headers
  const normalizedData = playerData.map((row) => {
    const normalizedRow: UploadedRow = {};
    headers.forEach((header) => {
      normalizedRow[header] = row[header] ?? ""; // Fill missing keys with empty strings
    });
    return normalizedRow;
  });

  if (loading) {
    return <p className={styles.message}>Loading...</p>;
  }

  if (error) {
    return <p className={styles.message}>Error: {error}</p>;
  }

  if (players.length === 0) {
    return <p className={styles.message}>No players available.</p>;
  }

  return (
    <div className={styles.analysisPageContainer}>
        <header className={styles.header}>
          <div className={styles.logo}>SportPBL</div>
          <div className={styles.headerRight}>
            <button className={styles.button} onClick={() => router.push("/home")}>Home</button>
            <button className={styles.button} onClick={() => router.push("/settings")}>Settings</button>
          </div>
        </header>

      <div className={styles.filtersContainer}>
        <h1>分析ページ</h1>
        {error && <div className={styles.error}>{error}</div>}

        {players.length > 0 && (
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label>日付</label>
              <input type="date" value={startDate} onChange={(e) => handleDateChange(e, "start")} />
              <input type="date" value={endDate} onChange={(e) => handleDateChange(e, "end")} />

              <span>or</span>
              <button className={styles.button} onClick={() => { setStartDate(""); setEndDate(""); }}>全期間</button>
            </div>

            <div className={styles.filterGroup}>
              <label>選手</label>
              <select value={selectedPlayer || ""} onChange={(e) => setSelectedPlayer(e.target.value)}>
                <option value="" disabled>選択してください</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>{player.name}</option>
                ))}
              </select>
              <button className={styles.addButton} onClick={handleFetchData}>データを取得</button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.dataResults}>
        <h2>分析結果: {selectedPlayer && players.find((p) => p.id === selectedPlayer)?.name}</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                {headers.map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {normalizedData.map((row, index) => (
                <tr key={index}>
                  {headers.map((key) => (
                    <td key={key}>
                      {typeof row[key] === "object" && row[key]?.seconds
                        ? new Date(row[key].seconds * 1000).toLocaleString() // Handle Firestore timestamp
                        : row[key].toString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
