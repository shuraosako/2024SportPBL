"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // Import useRouter
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../login/page"; 

// Define Player type
type Player = {
  id: string;
  name: string;
  grade: string;
  height: number;
  weight: number;
};

export default function PlayerPage() {
  const { id } = useParams(); 
  const router = useRouter(); 
  const [player, setPlayer] = useState<Player | null>(null); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchPlayer = async () => {
        if (!id) return;
      
        try {
          const playerDoc = await getDoc(doc(db, "players", id as string)); 
          if (playerDoc.exists()) {
            const playerData = playerDoc.data() as Omit<Player, 'id'>; 
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

  if (loading) {
    return <div>Loading..</div>; 
  }

  if (!player) {
    return <div>No player found.</div>; 
  }

  return (
    <div>
      <h1>{player.name}</h1>
      <p>Grade: {player.grade}</p>
      <p>Height: {player.height} cm</p>
      <p>Weight: {player.weight} kg</p>
      <button onClick={() => router.push("/home")}>Back to Home</button> {/* Back button */}
    </div>
  );
}
