"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../login/page";
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

// データ型の定義
type PlayerData = {
  id: number;
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
  const [selectedItem, setSelectedItem] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [playerData, setPlayerData] = useState<PlayerData[]>([]);
  const [currentTab, setCurrentTab] = useState<"average" | "best" | "individual">("average");

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
          const querySnapshot = await getDocs(collection(db, `players/${playerId}/csv`));
          const playerData = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: parseInt(doc.id)
          })) as PlayerData[];
          data = [...data, ...playerData];
        }

        // 日付フィルター
        if (!showAllPeriod && startDate && endDate) {
          data = data.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate && itemDate <= endDate;
          });
        }

        // ソート
        data.sort((a, b) => {
          const aValue = a[selectedItem as keyof PlayerData];
          const bValue = b[selectedItem as keyof PlayerData];
          return sortOrder === "asc" 
            ? (aValue < bValue ? -1 : 1)
            : (aValue > bValue ? -1 : 1);
        });

        setPlayerData(data);
      } catch (error) {
        console.error("Error fetching player data:", error);
      }
    };

    fetchPlayerData();
  }, [selectedPlayers, startDate, endDate, showAllPeriod, selectedItem, sortOrder, players]);

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
    return players.map(player => {
      const playerStats = playerData.filter(data => data.id.toString() === player.id);
      return {
        name: player.name,
        avgSpeed: playerStats.length 
          ? playerStats.reduce((sum, item) => sum + item.speed, 0) / playerStats.length
          : 0,
        avgSpin: playerStats.length 
          ? playerStats.reduce((sum, item) => sum + item.spin, 0) / playerStats.length
          : 0
      };
    });
  };

  // 最高記録の計算
  const calculateBest = () => {
    return players.map(player => {
      const playerStats = playerData.filter(data => data.id.toString() === player.id);
      return {
        name: player.name,
        bestSpeed: playerStats.length ? Math.max(...playerStats.map(item => item.speed)) : 0,
        bestSpin: playerStats.length ? Math.max(...playerStats.map(item => item.spin)) : 0
      };
    });
  };

  // 個人グラフデータの処理
  const getIndividualData = (playerId: string) => {
    return playerData
      .filter(data => data.id.toString() === playerId)
      .map(data => ({
        date: data.date,
        speed: data.speed,
        spin: data.spin,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  return (
    <>
      <header>
        <ul className="header-container">
          <li className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            &#9776;
          </li>
          <li className="logo">SportsPBL</li>
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
                  onChange={(e) => setSelectedItem(e.target.value)}
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
                {["average", "best", "individual"].map((tab) => (
                  <button
                    key={tab}
                    className={`tab-button ${currentTab === tab ? "active" : ""}`}
                    onClick={() => setCurrentTab(tab as "average" | "best" | "individual")}
                  >
                    {tab === "average" ? "平均グラフ" : tab === "best" ? "ベストグラフ" : "個人グラフ"}
                  </button>
                ))}
              </div>
            </div>

            {/* データテーブル */}
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

            {/* グラフ表示 */}
            <div className="graphs-container">
              {currentTab === "average" && (
                <div className="graph-section">
                  <h3 className="graph-title">平均値グラフ</h3>
                  <div className="graph-grid">
                    <div className="graph-item">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={calculateAverages()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line type="monotone" dataKey="avgSpeed" stroke={COLORS.primary} name="平均球速" />
                          <Line type="monotone" dataKey="avgSpin" stroke={COLORS.secondary} name="平均SPIN" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="graph-item">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={calculateAverages()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar dataKey="avgSpeed" fill={COLORS.primary} name="平均球速" />
                          <Bar dataKey="avgSpeed" fill={COLORS.primary} name="平均球速" />
<Bar dataKey="avgSpin" fill={COLORS.secondary} name="平均SPIN" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {currentTab === "best" && (
                <div className="graph-section">
                  <h3 className="graph-title">最高記録グラフ</h3>
                  <div className="graph-grid">
                    <div className="graph-item">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={calculateBest()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line type="monotone" dataKey="bestSpeed" stroke={COLORS.primary} name="最高球速" />
                          <Line type="monotone" dataKey="bestSpin" stroke={COLORS.secondary} name="最高SPIN" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="graph-item">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={calculateBest()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
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
                  {selectedPlayers.map(playerId => {
                    const playerName = players.find(p => p.id === playerId)?.name;
                    const individualData = getIndividualData(playerId);
                    
                    return (
                      <div key={playerId} className="individual-graph">
                        <h4>{playerName}の推移</h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={individualData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" orientation="left" stroke={COLORS.primary} />
                            <YAxis yAxisId="right" orientation="right" stroke={COLORS.secondary} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="speed" stroke={COLORS.primary} name="球速" />
                            <Line yAxisId="right" type="monotone" dataKey="spin" stroke={COLORS.secondary} name="SPIN" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}