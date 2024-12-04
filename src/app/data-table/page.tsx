"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./../login/page";
import styles from "./DataTablePage.module.css";

type UploadedRow = Record<string, any>;

export default function DataTable() {
  const searchParams = useSearchParams();
  const playerId = searchParams.get("playerId");
  const [uploadedData, setUploadedData] = useState<UploadedRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerId) {
      console.error("No playerId provided.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        console.log("Fetching data for playerId:", playerId);
        const subcollectionRef = collection(db, "players", playerId, "csvData");
        const snapshot = await getDocs(subcollectionRef);

        if (snapshot.empty) {
          console.log("No documents found in the csvData subcollection.");
          setUploadedData([]);
        } else {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUploadedData(data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [playerId]);

  // Create consistent headers from all rows
  const headers = uploadedData.length
    ? Array.from(
        new Set(uploadedData.flatMap((row) => Object.keys(row)))
      )
    : [];

  // Normalize rows to match headers
  const normalizedData = uploadedData.map((row) => {
    const normalizedRow: UploadedRow = {};
    headers.forEach((header) => {
      normalizedRow[header] = row[header] ?? ""; // Fill missing keys with empty strings
    });
    return normalizedRow;
  });

  if (loading) {
    return <p className={styles.message}>Loading...</p>;
  }

  if (!uploadedData || uploadedData.length === 0) {
    return <p className={styles.message}>No data available.</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Uploaded Data</h1>
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
  );
}
