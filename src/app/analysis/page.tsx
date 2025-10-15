"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db,} from "@/lib/firebase";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./analysis.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// 色の定義
const COLORS = {
  primary: "#2563eb",
  secondary: "#10b981",
  tertiary: "#f59e0b",
  background: "#f3f4f6",
  border: "#e5e7eb",
  text: "#1f2937",
  lightText: "#6b7280",
};

const mapRawDataToPlayerData = (rawData: any): PlayerData => {
  console.log('Mapping Raw Data:', rawData); // Debugging step

  const parsedSpeed = parseFloat(rawData["速度(kph)"]?.trim());
  const parsedSpin = parseInt(rawData["SPIN"]?.trim(), 10);

  // Log issues with parsing
  if (isNaN(parsedSpeed)) {
    console.error('Invalid Speed Detected:', rawData["速度(kph)"]);
  }
  if (isNaN(parsedSpin)) {
    console.error('Invalid Spin Detected:', rawData["SPIN"]);
  }

  return {
    id: rawData.id || "unknown-id",
    documentId: rawData.documentId || undefined,
    date: rawData["日付"] || "unknown-date",
    speed: isNaN(parsedSpeed) ? 0 : parsedSpeed, // Fallback to 0
    spin: isNaN(parsedSpin) ? 0 : parsedSpin,   // Fallback to 0
    trueSpin: parseInt(rawData["TRUE SPIN"]?.trim(), 10) || 0,
    spinEff: parseFloat(rawData["SPIN EFF."]?.replace("%", "").trim()) || 0,
    spinDirection: convertSpinDirection(rawData["SPIN DIRECTION"]),
    verticalMovement: parseFloat(rawData["線の変化量(cm)"]?.trim()) || 0,
    horizontalMovement: parseFloat(rawData["軸の変化量(cm)"]?.trim()) || 0,
    strike: rawData["ストライク"] === "はい" ? 1 : 0,
    releasePoint: parseFloat(rawData["リリースポイントの高さ(m)"]?.trim()) || 0,
    absorption: rawData.absorption || "unknown",
  };
};

const convertSpinDirection = (spinDirection: string): number => {
  if (!spinDirection.includes("h") || !spinDirection.includes("m")) {
    return 0; // Default fallback
  }
  const [hours, minutes] = spinDirection
    .replace("h", "")
    .replace("m", "")
    .split(":")
    .map((val) => parseInt(val));
  return hours * 30 + minutes * 0.5; // Convert hours and minutes to degrees
};



// データ型の定義
type PlayerData = {
  id: string;
  documentId?: string;
  date: string;
  speed: number;
  spin: number;
  trueSpin: number;
  spinEff: number;
  spinDirection: number;
  verticalMovement: number;
  horizontalMovement: number;
  strike: number;
  releasePoint: number;
  absorption: string;
};

type SortableField = 'date' | 'speed' | 'spin';

type Player = {
  id: string;
  name: string;
};

export default function AnalysisPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showAllPeriod, setShowAllPeriod] = useState(true);
  const [selectedItem, setSelectedItem] = useState<SortableField>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [playerData, setPlayerData] = useState<PlayerData[]>([]);
  const [currentTab, setCurrentTab] = useState<"whole" | "best" | "individual"|"compare">("whole");
  const [comparePlayers, setComparePlayers] = useState<string[]>([]);
  const [compareField, setCompareField] = useState<keyof PlayerData | null>(null);


  useEffect(() => {
    const fetchRawPlayerData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "players"));
        const normalizedData = querySnapshot.docs.map((doc) =>
          mapRawDataToPlayerData(doc.data())
        );
        setPlayerData(normalizedData); // Replace this with your existing setter or state logic
      } catch (error) {
        console.error("Error fetching player data:", error);
      }
    };
  
    fetchRawPlayerData();
  }, []);

  // プロフィール情報取得
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserName(user.email);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setProfileImage(data?.profileImageUrl || null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  // プレイヤー一覧の取得
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "players"));
        const playersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        }));
        setPlayers(playersList);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };
    fetchPlayers();
  }, []);

  // プレイヤーデータの取得
  useEffect(() => {
    const fetchPlayerData = async () => {
      if (selectedPlayers.length === 0 && !showAllPeriod) return;
  
      try {
        let data: PlayerData[] = [];
        const targetPlayers = selectedPlayers.length ? selectedPlayers : players.map(p => p.id);
  
        for (const playerId of targetPlayers) {
          const csvCollectionRef = collection(db, `players/${playerId}/csvData`);
          const querySnapshot = await getDocs(csvCollectionRef);
  
          const playerData = querySnapshot.docs
            .map(doc => {
              const rawData = doc.data();
              // Skip invalid documents
              if (rawData["速度(kph)"] === "-" || rawData["SPIN"] === "-") {
                console.log(`Skipping document with invalid data: ${doc.id}`);
                return null;
              }
              // Map raw data to PlayerData
              return mapRawDataToPlayerData({
                ...rawData,
                id: playerId,
                documentId: doc.id,
              });
            })
            .filter(item => item !== null) as PlayerData[]; // Filter out null values
  
          data = [...data, ...playerData];
        }
  
        // Filter by date range if required
        if (!showAllPeriod && startDate && endDate) {
          data = data.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate && itemDate <= endDate;
          });
        }
  
        // Sort data
        data.sort((a, b) => {
          const getValue = (item: PlayerData, key: SortableField) => {
            if (key === 'date') return new Date(item.date).getTime();
            return key === 'speed' ? item.speed : item.spin;
          };
  
          const aValue = getValue(a, selectedItem);
          const bValue = getValue(b, selectedItem);
  
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
        });
  
        setPlayerData(data); // Update state with processed data
      } catch (error) {
        console.error("Error fetching player data:", error);
      }
    };
  
    fetchPlayerData();
  }, [selectedPlayers, showAllPeriod, startDate, endDate, selectedItem, sortOrder, players]);
  

  const toggleProfilePopup = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const navigateToProfile = () => {
    router.push("/profile");
  };

  // グラフ用のカスタムツールチップ
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`選手: ${label}`}</p>
          {payload.map((pld: any, index: number) => (
            <p key={index} style={{ color: pld.color }}>
              {`${pld.name}: ${pld.value.toFixed(2)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 平均値の計算
  const calculateAverages = () => {
    const averages = players.map(player => {
      const playerStats = playerData.filter(data => data.id === player.id);
      console.log('Player Stats:', player.name, playerStats); // デバッグ用
      return {
        name: player.name,
        avgSpeed: playerStats.length 
          ? playerStats.reduce((sum, item) => sum + Number(item.speed), 0) / playerStats.length
          : 0,
        avgSpin: playerStats.length 
          ? playerStats.reduce((sum, item) => sum + Number(item.spin), 0) / playerStats.length
          : 0
      };
    });
    console.log('Averages:', averages); // デバッグ用
    return averages;
  };

  // 最高記録の計算
  const calculateBest = () => {
    const best = players.map(player => {
      const playerStats = playerData.filter(data => data.id.toString() === player.id);
      return {
        name: player.name,
        bestSpeed: playerStats.length ? Math.max(...playerStats.map(item => Number(item.speed))) : 0,
        bestSpin: playerStats.length ? Math.max(...playerStats.map(item => Number(item.spin))) : 0
      };
    });
    console.log('Best Records:', best); // デバッグ用
    return best;
  };

  
  const fetchPlayerData = async () => {
    // Fetch data from Firestore or wherever your player data is stored
    const querySnapshot = await getDocs(collection(db, "players"));
    const fetchedData: PlayerData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Assuming the data contains "date", "速度(kph)", and "SPIN"
      fetchedData.push(mapRawDataToPlayerData(data));
    });
    setPlayerData(fetchedData);
  };
  // 個人グラフデータの処理
  const getIndividualData = (playerId: string) => {
    const filteredData = playerData
      .filter((data) => data.id === playerId)
      .map((data) => {
        // Parse and validate the fields
        const parsedSpeed = Number(data.speed);
        const parsedSpin = Number(data.spin);
        const parsedDate = new Date(data.date);
  
        return {
          date: parsedDate,
          speed: isNaN(parsedSpeed) ? 0 : parsedSpeed, // Ensure valid speed
          spin: isNaN(parsedSpin) ? 0 : parsedSpin,   // Ensure valid spin
        };
      })
      .filter((item) => !isNaN(item.speed) && !isNaN(item.spin)); // Filter out invalid entries
  
    // Sort the data
    filteredData.sort((a, b) => {
      const getValue = (item: typeof filteredData[0], key: SortableField) => {
        switch (key) {
          case 'date': return item.date.getTime();
          case 'speed': return item.speed;
          case 'spin': return item.spin;
          default: return 0;
        }
      };
  
      const aValue = getValue(a, selectedItem);
      const bValue = getValue(b, selectedItem);
  
      // Ascending or Descending order
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  
    console.log('Sorted Individual Data:', filteredData); // Debug log
    return filteredData;
  };
  const prepareCompareData = () => {
    if (!compareField || comparePlayers.length === 0) return [];
    
    const data = comparePlayers.map(playerId => {
      const player = players.find(p => p.id === playerId);
      const playerStats = playerData.filter(data => data.id === playerId);
      
      return {
        name: player?.name || "Unknown",
        value: playerStats.length 
          ? playerStats.reduce((sum, item) => sum + (Number(item[compareField]) || 0), 0) / playerStats.length
          : "NIL",
      };
    });
  
    return data;
  };
  return (
    <>
      <header>
        <ul className="header-container">
          <li className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            &#9776;
          </li>
          <li className="logo"><Link href="/home"></Link>SportsPBL</li>
          <div className="header-right">
            <li className="profile-section" onClick={toggleProfilePopup}>
              <img
                src={profileImage || "/default-profile.png"}
                alt="Profile"
                className="profile-image"
              />
              {isProfileOpen && (
                <div className="profile-popup">
                  <p>{userName}</p>
                  <button onClick={navigateToProfile}>Profile</button>
                  <button onClick={() => router.push("/login")}>Logout</button>
                </div>
              )}
            </li>
            <li><Link href="/login">LOGIN</Link></li>
            <li><Link href="http://localhost:3000">TOP</Link></li>
            <li><a href="#">Setting</a></li>
          </div>
        </ul>
      </header>
      <div className="header-underline"></div>

      <div className="main-content">
        <div className={`LeftSelection ${isMenuOpen ? "open" : ""}`}>
          <div className="Selection">
            <Link href="/home">Home</Link>
            <div className="kai"></div>
            <Link href="/analysis">Analysis</Link>
            <div className="kai"></div>
            <Link href="/profile">Profile</Link>
            <div className="kai"></div>
            <Link href="">Settings</Link>
            <div className="kai"></div>
            <Link href="">Rapsodo</Link>
            <div className="kai"></div>
            <Link href="/home">Home</Link>
          </div>
        </div>

        <div className="RightContent">
          <div className="analysis-container">
            {/* フィルターセクション */}
            <div className="filter-section">
              <div className="date-filter">
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  selectsStart
                  startDate={startDate ?? undefined}
                  endDate={endDate ?? undefined}
                  placeholderText="開始日"
                  disabled={showAllPeriod}
                  className="date-picker"
                />
                <span>~</span>
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate ?? undefined}
                  endDate={endDate ?? undefined}
                  placeholderText="終了日"
                  disabled={showAllPeriod}
                  className="date-picker"
                />
                <label className="period-checkbox">
                  <input
                    type="checkbox"
                    checked={showAllPeriod}
                    onChange={(e) => setShowAllPeriod(e.target.checked)}
                  />
                  <span>全期間</span>
                </label>
              </div>

              <div className="sort-filter">
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value as SortableField)}
                className="select-box"
              >
                  <option value="date">日付</option>
                  <option value="speed">球速</option>
                  <option value="spin">SPIN</option>
                </select>

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                  className="select-box"
                >
                  <option value="asc">昇順</option>
                  <option value="desc">降順</option>
                </select>
              </div>

              <select
                multiple
                value={selectedPlayers}
                onChange={(e) => setSelectedPlayers(Array.from(e.target.selectedOptions, option => option.value))}
                className="player-select"
              >
                <option value="NIL">NIL</option> {/* Default NIL option */}
                {players.map(player => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>

            {/* タブ切り替え */}
            <div className="tab-container">
              <div className="tabs">
                {["whole", "best", "individual", "compare"].map((tab) => (
                  <button
                    key={tab}
                    className={`tab-button ${currentTab === tab ? "active" : ""}`}
                    onClick={() => setCurrentTab(tab as "whole" | "best" | "individual" | "compare")}
                  >
                    {tab === "whole"
                      ? "全体"
                      : tab === "best"
                      ? "ベストグラフ"
                      : tab === "individual"
                      ? "個人グラフ"
                      : "比較グラフ"}
                  </button>
                ))}
              </div>
            </div>;

{/*
            
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>選手名</th>
                    <th>日付</th>
                    <th>球速</th>
                    <th>SPIN</th>
                    <th>TRUE SPIN</th>
                    <th>SPIN EFF</th>
                    <th>SPIN DIRECT</th>
                  </tr>
                </thead>
                <tbody>
                  {playerData.map((data, index) => (
                    <tr key={index}>
                      <td>{players.find(p => p.id === data.id.toString())?.name}</td>
                      <td>{data.date}</td>
                      <td>{data.speed}</td>
                      <td>{data.spin}</td>
                      <td>{data.trueSpin}</td>
                      <td>{data.spinEff}</td>
                      <td>{data.spinDirection}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
*/}
            {/* グラフ表示 */}
            <div className="graphs-container">
             

              {currentTab === "best" && (
                <div className="graph-section">
                  <h3 className="graph-title">最高記録グラフ</h3>
                  <div className="graph-grid">
                    <div className="graph-item">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={calculateBest()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" stroke="#666" />
                          <YAxis 
                            yAxisId="speed"
                            orientation="left"
                            stroke={COLORS.primary}
                            domain={['auto', 'auto']}
                          />
                          <YAxis 
                            yAxisId="spin"
                            orientation="right"
                            stroke={COLORS.secondary}
                            domain={['auto', 'auto']}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line 
                            yAxisId="speed"
                            type="monotone" 
                            dataKey="bestSpeed" 
                            stroke={COLORS.primary} 
                            name="最高球速"
                            dot={true}
                          />
                          <Line 
                            yAxisId="spin"
                            type="monotone" 
                            dataKey="bestSpin" 
                            stroke={COLORS.secondary} 
                            name="最高SPIN"
                            dot={true}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="graph-item">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={calculateBest()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar dataKey="bestSpeed" fill={COLORS.primary} name="最高球速" />
                          <Bar dataKey="bestSpin" fill={COLORS.secondary} name="最高SPIN" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

                  {currentTab === "individual" && selectedPlayers.length > 0 && (
                    <div className="graph-section">
                      <h3 className="graph-title">個人グラフ</h3>
                      {selectedPlayers.map((playerId) => {
                        const playerName = players.find((p) => p.id === playerId)?.name;
                        const individualData = getIndividualData(playerId);

                        return (
                            <div key={playerId} className="individual-graph">
                              <h4>{playerName} - Pitch Speed vs. Spin</h4>
                              <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={individualData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis
                                    dataKey="speed"
                                    label={{ value: "Speed (kph)", position: "insideBottomRight", offset: 0 }}
                                    stroke={COLORS.primary}
                                    type="number"
                                    domain={["dataMin", "dataMax"]}
                                  />
                                  <YAxis
                                    label={{ value: "Spin", angle: -90, position: "insideLeft" }}
                                    stroke={COLORS.secondary}
                                    type="number"
                                    domain={["dataMin", "dataMax"]}
                                  />
                                  <Tooltip content={<CustomTooltip />} />
                                  <Legend />
                                  <Line
                                    type="monotone"
                                    dataKey="spin"
                                    stroke={COLORS.secondary}
                                    name="Spin"
                                    dot={true}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          );
                      })}
                    </div>
                  )}

                  {currentTab === "compare" && (
                    <div className="graph-section">
                      <h3 className="graph-title">選手比較</h3>
                      
                      {/* Player selection */}
                      <div className="compare-controls">
                        <select
                          multiple
                          value={comparePlayers}
                          onChange={(e) => setComparePlayers(Array.from(e.target.selectedOptions, option => option.value))}
                          className="player-select"
                        >
                          {players.map(player => (
                            <option key={player.id} value={player.id}>
                              {player.name}
                            </option>
                          ))}
                        </select>
                        
                        {/* Field selection */}
                        <select
                          value={compareField ?? ""}
                          onChange={(e) => setCompareField(e.target.value as keyof PlayerData)}
                          className="field-select"
                        >
                          <option value="">データを選択してください</option>
                          <option value="speed">球速</option>
                          <option value="spin">SPIN</option>
                          <option value="trueSpin">TRUE SPIN</option>
                          <option value="spinEff">SPIN EFF</option>
                          <option value="spinDirection">SPIN DIRECTION</option>
                        </select>
                      </div>

                     {/* Graph */}
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={prepareCompareData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="#82ca9d" name={compareField?.toUpperCase()} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}