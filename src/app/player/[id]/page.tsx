"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  writeBatch,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
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
  imageURL?: string;
};

// ファイルデータの型定義
type FileRow = {
  [key: string]: string | number | null;
};

export default function PlayerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [fileData, setFileData] = useState<FileRow[]>([]);

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
<<<<<<< HEAD
          // Parse CSV file with a specified encoding
=======
>>>>>>> main
          Papa.parse(data as string, {
            header: true,
            encoding: "UTF-8", // Explicitly set the encoding to UTF-8
            complete: (result) => {
              setFileData(result.data as FileRow[]);
            },
            skipEmptyLines: true, // Optional: skips any empty lines in the CSV
          });
        } else if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          setFileData(jsonData as FileRow[]);
        }
      };
      reader.readAsText(file, "UTF-8"); // Explicitly read the file as UTF-8 encoded text
    }
  };

  const handleDataUpload = async () => {
    if (!fileData.length || !player) {
      alert("No data to upload or player not found.");
      return;
    }

    try {
      const playerRef = doc(db, "players", player.id); // Reference to the player's document
      const subcollectionRef = collection(playerRef, "csvData"); // Subcollection "csvData"

      // Delete existing data in the subcollection
      const existingDocsSnapshot = await getDocs(subcollectionRef);
      const batch = writeBatch(db);
      existingDocsSnapshot.forEach((doc) => {
        batch.delete(doc.ref); // Delete each document in the subcollection
      });

      // Add new data from the CSV file
      fileData.forEach((row) => {
        const docData = {
          ...row, // Store each row as-is
          uploadedAt: serverTimestamp(), // Add a timestamp for each row
        };
        const docRef = doc(subcollectionRef); // Auto-generate document ID
        batch.set(docRef, docData);
      });

      // Commit all batched writes
      await batch.commit();

      alert("CSV data replaced successfully!");
      setFileData([]); // Clear the file data after successful upload
    } catch (error) {
      console.error("Error replacing data:", error);
      alert("Failed to replace data. Check the console for more details.");
    }
  };

  const handleRedirect = () => {
    if (!player?.id) {
      alert("Player ID is missing");
      return;
    }
    // Redirect with the player ID in the query parameter
    router.push(`/data-table?playerId=${player.id}`);
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

      {player.imageURL && (
        <img
          src={player.imageURL}
          alt={`${player.name}'s profile`}
          className={styles.profilePicture}
        />
      )}

      <button onClick={() => router.push("/home")} className={styles.button}>
        Back to Home
      </button>

      <input
        type="file"
        accept=".csv, .xlsx"
        onChange={handleFileUpload}
        className={styles.fileInput}
      />
      <button onClick={handleDataUpload} className={styles.button}>
        Upload CSV Data
      </button>

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
                  {Object.entries(row).map(([key, value], i) => (
                    <td key={`${index}-${key}`}>
                      {value !== null ? String(value) : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Button to view uploaded data */}
      <button 
            onClick={handleRedirect} 
            className={styles.button}>
        View Uploaded Data
      </button>
    </div>
  );
}