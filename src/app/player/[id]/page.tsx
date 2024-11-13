// PlayerPage.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../login/page";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import styles from "./PlayerPage.module.css";

type Player = {
  id: string;
  name: string;
  grade: string;
  height: number;
  weight: number;
  imageUrl?: string;
};

export default function PlayerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [fileData, setFileData] = useState<any[]>([]);

  useEffect(() => {
    const fetchPlayer = async () => {
      if (!id) return;

      try {
        const playerDoc = await getDoc(doc(db, "players", id as string));
        if (playerDoc.exists()) {
          const playerData = playerDoc.data() as Omit<Player, "id">;
          setPlayer({ id: id as string, ...playerData });
        } else {
          console.error("Player not found");
        }
      } catch (error) {
        console.error("Error fetching player:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [id]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        if (file.type === "text/csv") {
          // Parse CSV file
          Papa.parse(data as string, {
            header: true,
            complete: (result) => {
              setFileData(result.data);
            },
          });
        } else if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
          // Parse XLSX file
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          setFileData(jsonData as any[]);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!player) {
    return <div>No player found.</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>{player.name}</h1>
      <p className={styles.info}>Grade: {player.grade}</p>
      <p className={styles.info}>Height: {player.height} cm</p>
      <p className={styles.info}>Weight: {player.weight} kg</p>
      
      {player.imageUrl && (
        <img
          src={player.imageUrl}
          alt={`${player.name}'s profile`}
          className={styles.profilePicture}
        />
      )}

      <button onClick={() => router.push("/home")} className={styles.button}>
        Back to Home
      </button>

      {/* File Upload Section */}
      <input
        type="file"
        accept=".csv, .xlsx"
        onChange={handleFileUpload}
        className={styles.fileInput}
      />

      {/* Display uploaded file data */}
      {fileData.length > 0 && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                {Object.keys(fileData[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fileData.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
