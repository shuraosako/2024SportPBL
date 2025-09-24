"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db,} from "@/lib/firebase";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
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
  accent: "#8b5cf6",
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
  const [currentTab, setCurrentTab] = useState<"average" | "best" | "individual"|"compare">("average");
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

  // 全体グラフ用の関数
  const getAllPlayersSpeedDistribution = () => {
    const speedRanges = [
      { range: "~80", min: 0, max: 80 },
      { range: "80-85", min: 80, max: 85 },
      { range: "85-90", min: 85, max: 90 },
      { range: "90-95", min: 90, max: 95 },
      { range: "95-100", min: 95, max: 100 },
      { range: "100-105", min: 100, max: 105 },
      { range: "105+", min: 105, max: 999 }
    ];

    return speedRanges.map(range => ({
      speedRange: range.range,
      count: playerData.filter(data => 
        data.speed > range.min && data.speed <= range.max
      ).length
    }));
  };

  const getAllPlayersSpinDistribution = () => {
    const spinRanges = [
      { range: "~1500", min: 0, max: 1500 },
      { range: "1500-2000", min: 1500, max: 2000 },
      { range: "2000-2500", min: 2000, max: 2500 },
      { range: "2500-3000", min: 2500, max: 3000 },
      { range: "3000+", min: 3000, max: 9999 }
    ];

    return spinRanges.map(range => ({
      spinRange: range.range,
      count: playerData.filter(data => 
        data.spin > range.min && data.spin <= range.max
      ).length
    }));
  };

  const getAllPlayersScatterData = () => {
    return playerData.map(data => ({
      speed: data.speed,
      spin: data.spin,
      playerName: players.find(p => p.id === data.id)?.name || "Unknown"
    }));
  };

  // 平均値の計算
  const calculateAverages = () => {
    const averages = players.map(player => {
      const playerStats = playerData.filter(data => data.id === player.id);
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
    return best;
  };

  // ベストグラフ用の関数
  const getBestSpeed = () => {
    let bestRecord = { value: 0, player: "", date: "" };
    playerData.forEach(data => {
      if (data.speed > bestRecord.value) {
        bestRecord = {
          value: data.speed,
          player: players.find(p => p.id === data.id)?.name || "Unknown",
          date: data.date
        };
      }
    });
    return bestRecord;
  };

  const getBestSpin = () => {
    let bestRecord = { value: 0, player: "", date: "" };
    playerData.forEach(data => {
      if (data.spin > bestRecord.value) {
        bestRecord = {
          value: data.spin,
          player: players.find(p => p.id === data.id)?.name || "Unknown",
          date: data.date
        };
      }
    });
    return bestRecord;
  };

  const getBestTrueSpin = () => {
    let bestRecord = { value: 0, player: "", date: "" };
    playerData.forEach(data => {
      if (data.trueSpin > bestRecord.value) {
        bestRecord = {
          value: data.trueSpin,
          player: players.find(p => p.id === data.id)?.name || "Unknown",
          date: data.date
        };
      }
    });
    return bestRecord;
  };

  const getBestRecordsHistory = () => {
    const sortedData = [...playerData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let maxSpeed = 0;
    let maxSpin = 0;
    
    return sortedData.map(data => {
      if (data.speed > maxSpeed) maxSpeed = data.speed;
      if (data.spin > maxSpin) maxSpin = data.spin;
      
      return {
        date: data.date,
        bestSpeed: maxSpeed,
        bestSpin: maxSpin
      };
    });
  };

  // 個人グラフデータの処理
  const getIndividualData = (playerId: string) => {
    const filteredData = playerData
      .filter((data) => data.id === playerId)
      .map((data) => {
        const parsedSpeed = Number(data.speed);
        const parsedSpin = Number(data.spin);
        const parsedDate = new Date(data.date);
  
        return {
          date: parsedDate,
          speed: isNaN(parsedSpeed) ? 0 : parsedSpeed,
          spin: isNaN(parsedSpin) ? 0 : parsedSpin,
        };
      })
      .filter((item) => !isNaN(item.speed) && !isNaN(item.spin));
  
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
  
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  
    return filteredData;
  };

  // レーダーチャート用の関数
  const prepareRadarData = () => {
    const subjects = ['球速', '回転数', 'TRUE SPIN', 'SPIN EFF', 'ストライク率'];
    
    // 各指標の最大値を計算（正規化用）
    const maxValues = {
      speed: Math.max(...playerData.map(d => d.speed)),
      spin: Math.max(...playerData.map(d => d.spin)),
      trueSpin: Math.max(...playerData.map(d => d.trueSpin)),
      spinEff: Math.max(...playerData.map(d => d.spinEff)),
      strike: 1 // ストライク率は0-1なので最大値は1
    };

    const radarData = subjects.map(subject => {
      const dataPoint: any = { subject };
      
      comparePlayers.forEach(playerId => {
        const playerStats = playerData.filter(data => data.id === playerId);
        if (playerStats.length > 0) {
          let value = 0;
          switch (subject) {
            case '球速':
              value = (playerStats.reduce((sum, item) => sum + item.speed, 0) / playerStats.length) / maxValues.speed * 100;
              break;
            case '回転数':
              value = (playerStats.reduce((sum, item) => sum + item.spin, 0) / playerStats.length) / maxValues.spin * 100;
              break;
            case 'TRUE SPIN':
              value = (playerStats.reduce((sum, item) => sum + item.trueSpin, 0) / playerStats.length) / maxValues.trueSpin * 100;
              break;
            case 'SPIN EFF':
              value = (playerStats.reduce((sum, item) => sum + item.spinEff, 0) / playerStats.length) / maxValues.spinEff * 100;
              break;
            case 'ストライク率':
              value = (playerStats.reduce((sum, item) => sum + item.strike, 0) / playerStats.length) * 100;
              break;
          }
          dataPoint[playerId] = Math.round(value);
        }
      });
      
      return dataPoint;
    });

    return radarData;
  };

  const getPlayerCompareStats = (playerId: string) => {
    const playerStats = playerData.filter(data => data.id === playerId);
    
    if (playerStats.length === 0) {
      return {
        avgSpeed: 0, maxSpeed: 0, avgSpin: 0, maxSpin: 0,
        avgTrueSpin: 0, avgSpinEff: 0
      };
    }

    return {
      avgSpeed: playerStats.reduce((sum, item) => sum + item.speed, 0) / playerStats.length,
      maxSpeed: Math.max(...playerStats.map(item => item.speed)),
      avgSpin: playerStats.reduce((sum, item) => sum + item.spin, 0) / playerStats.length,
      maxSpin: Math.max(...playerStats.map(item => item.spin)),
      avgTrueSpin: playerStats.reduce((sum, item) => sum + item.trueSpin, 0) / playerStats.length,
      avgSpinEff: playerStats.reduce((sum, item) => sum + item.spinEff, 0) / playerStats.length,
    };
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
          : 0,
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
          <li className="logo"><Link href="/home">SportsPBL</Link></li>
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
                {["average", "best", "individual", "compare"].map((tab) => (
                  <button
                    key={tab}
                    className={`tab-button ${currentTab === tab ? "active" : ""}`}
                    onClick={() => setCurrentTab(tab as "average" | "best" | "individual" | "compare")}
                  >
                    {tab === "average"
                      ? "全体グラフ"
                      : tab === "best"
                      ? "ベストグラフ"
                      : tab === "individual"
                      ? "個人グラフ"
                      : "比較グラフ"}
                  </button>
                ))}
              </div>
            </div>

            {/* グラフ表示 */}
            <div className="graphs-container">
              {/* 全体グラフ（旧平均グラフ） */}
              {currentTab === "average" && (
                <div className="graph-section">
                  <h3 className="graph-title">全体グラフ</h3>
                  
                  {/* 全選手のデータを統合したグラフ */}
                  <div className="graph-grid">
                    <div className="graph-item">
                      <h4>球速分布</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getAllPlayersSpeedDistribution()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="speedRange" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill={COLORS.primary} name="球数" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="graph-item">
                      <h4>回転数分布</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getAllPlayersSpinDistribution()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="spinRange" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill={COLORS.secondary} name="球数" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="graph-item">
                      <h4>球速 vs 回転数（全選手）</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart data={getAllPlayersScatterData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="speed" name="球速" stroke="#666" />
                          <YAxis dataKey="spin" name="回転数" stroke="#666" />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                          <Legend />
                          <Scatter name="全選手データ" data={getAllPlayersScatterData()} fill={COLORS.accent} />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="graph-item">
                      <h4>選手別平均値</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={calculateAverages()}>
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
                            dataKey="avgSpeed" 
                            stroke={COLORS.primary} 
                            name="平均球速"
                            dot={true}
                          />
                          <Line 
                            yAxisId="spin"
                            type="monotone" 
                            dataKey="avgSpin" 
                            stroke={COLORS.secondary} 
                            name="平均SPIN"
                            dot={true}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* ベストグラフ - カード形式で表示 */}
              {currentTab === "best" && (
                <div className="graph-section">
                  <h3 className="graph-title">ベストグラフ</h3>
                  
                  {/* ベスト記録カード */}
                  <div className="best-cards-container">
                    <div className="best-card">
                      <div className="best-card-header">最高球速</div>
                      <div className="best-card-value">{getBestSpeed().value} km/h</div>
                      <div className="best-card-player">{getBestSpeed().player}</div>
                      <div className="best-card-date">{getBestSpeed().date}</div>
                    </div>
                    
                    <div className="best-card">
                      <div className="best-card-header">最高回転数</div>
                      <div className="best-card-value">{getBestSpin().value}</div>
                      <div className="best-card-player">{getBestSpin().player}</div>
                      <div className="best-card-date">{getBestSpin().date}</div>
                    </div>
                    
                    <div className="best-card">
                      <div className="best-card-header">最高TRUE SPIN</div>
                      <div className="best-card-value">{getBestTrueSpin().value}</div>
                      <div className="best-card-player">{getBestTrueSpin().player}</div>
                      <div className="best-card-date">{getBestTrueSpin().date}</div>
                    </div>
                  </div>

                  {/* ベスト記録のグラフ表示 */}
                  <div className="graph-grid">
                    <div className="graph-item">
                      <h4>選手別最高球速</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={calculateBest()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar dataKey="bestSpeed" fill={COLORS.primary} name="最高球速" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="graph-item">
                      <h4>選手別最高回転数</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={calculateBest()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar dataKey="bestSpin" fill={COLORS.secondary} name="最高SPIN" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="graph-item">
                      <h4>ベスト記録推移</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={getBestRecordsHistory()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="bestSpeed" stroke={COLORS.primary} name="球速記録" />
                          <Line type="monotone" dataKey="bestSpin" stroke={COLORS.secondary} name="回転数記録" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* 個人グラフ */}
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

              {/* 比較グラフ - レーダーチャート */}
              {currentTab === "compare" && (
                <div className="graph-section">
                  <h3 className="graph-title">選手比較 (レーダーチャート)</h3>
                  
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
                  </div>

                  {/* レーダーチャート */}
                  {comparePlayers.length > 0 && (
                    <div className="radar-chart-container">
                      <ResponsiveContainer width="100%" height={500}>
                        <RadarChart data={prepareRadarData()}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis 
                            angle={0} 
                            domain={[0, 100]} 
                            tick={false}
                          />
                          <Tooltip />
                          <Legend />
                          {comparePlayers.map((playerId, index) => {
                            const playerName = players.find(p => p.id === playerId)?.name;
                            const colors = [COLORS.primary, COLORS.secondary, COLORS.accent, '#ff7300', '#00ff73'];
                            return (
                              <Radar
                                key={playerId}
                                name={playerName}
                                dataKey={playerId}
                                stroke={colors[index % colors.length]}
                                fill={colors[index % colors.length]}
                                fillOpacity={0.1}
                                strokeWidth={2}
                              />
                            );
                          })}
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* 詳細比較テーブル */}
                  {comparePlayers.length > 0 && (
                    <div className="compare-table-container">
                      <h4>詳細比較</h4>
                      <table className="compare-table">
                        <thead>
                          <tr>
                            <th>選手名</th>
                            <th>平均球速</th>
                            <th>最高球速</th>
                            <th>平均回転数</th>
                            <th>最高回転数</th>
                            <th>平均TRUE SPIN</th>
                            <th>平均SPIN EFF</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparePlayers.map(playerId => {
                            const playerStats = getPlayerCompareStats(playerId);
                            return (
                              <tr key={playerId}>
                                <td>{players.find(p => p.id === playerId)?.name}</td>
                                <td>{playerStats.avgSpeed.toFixed(1)} km/h</td>
                                <td>{playerStats.maxSpeed} km/h</td>
                                <td>{playerStats.avgSpin.toFixed(0)}</td>
                                <td>{playerStats.maxSpin}</td>
                                <td>{playerStats.avgTrueSpin.toFixed(0)}</td>
                                <td>{playerStats.avgSpinEff.toFixed(1)}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}