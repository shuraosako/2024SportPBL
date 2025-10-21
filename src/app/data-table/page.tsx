'use client';

import { Suspense } from 'react';
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navigation from "@/components/Navigation";
import styles from "./DataTablePage.module.css";

type UploadedRow = Record<string, any>;

function DataTableContent() {
 const searchParams = useSearchParams();
 const playerId = searchParams.get("playerId");
 const [uploadedData, setUploadedData] = useState<UploadedRow[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
   if (!playerId) {
     setLoading(false);
     return;
   }

   const fetchData = async () => {
     try {
       const subcollectionRef = collection(db, "players", playerId, "csvData");
       const snapshot = await getDocs(subcollectionRef);

       if (snapshot.empty) {
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

 const headers = uploadedData.length
   ? Array.from(
       new Set(uploadedData.flatMap((row) => Object.keys(row)))
     )
   : [];

 const normalizedData = uploadedData.map((row) => {
   const normalizedRow: UploadedRow = {};
   headers.forEach((header) => {
     normalizedRow[header] = row[header] ?? "";
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
   <>
     <Navigation showProfile={true} showHamburger={true} />
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
                     ? new Date(row[key].seconds * 1000).toLocaleString()
                     : row[key].toString()}
                 </td>
               ))}
             </tr>
           ))}
         </tbody>
       </table>
     </div>
   </div>
   </>
 );
}

export default function DataTable() {
 return (
   <Suspense fallback={<p className={styles.message}>Loading...</p>}>
     <DataTableContent />
   </Suspense>
 );
}