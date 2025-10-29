// 現在のコード全体
"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface Player {
  id: string;
  name: string;
}

interface PlayerData {
  id: string;
  date: string;
  speed: number;
  spin: number;
  trueSpin?: number;
  spinEff?: number;
  spinDirect?: number;
  verticalBreak?: number;
  horizontalBreak?: number;
  rating?: string;
}

interface WholeProps {
  players: Player[];
  playerData: PlayerData[];
  onSaveData?: (data: any[]) => void;
}

interface InputRow {
  id: string;
  playerId: string;
  playerName: string;
  date: string;
  speed: string;
  spinRate: string;
  trueSpin: string;
  spinEff: string;
  spinDirect: string;
  verticalBreak: string;
  horizontalBreak: string;
  rating: string;
  isNew: boolean;
  isExisting: boolean;
}

export default function Whole({
  players = [],
  playerData = [],
  onSaveData,
}: WholeProps) {
  const { t } = useLanguage();
  const [rows, setRows] = useState<InputRow[]>([]);
  const [searchName, setSearchName] = useState<string>("");

  // 既存データを初期表示用に変換
  useEffect(() => {
    const existingRows: InputRow[] = playerData.map((data, index) => {
      const player = players.find(p => p.id === data.id);
      return {
        id: `existing-data-${index}`,
        playerId: data.id,
        playerName: player?.name || t("player.notFound"),
        date: data.date,
        speed: data.speed.toString(),
        spinRate: data.spin.toString(),
        trueSpin: data.trueSpin?.toString() || "",
        spinEff: data.spinEff?.toString() || "",
        spinDirect: data.spinDirect?.toString() || "",
        verticalBreak: data.verticalBreak?.toString() || "",
        horizontalBreak: data.horizontalBreak?.toString() || "",
        rating: data.rating || "",
        isNew: false,
        isExisting: true,
      };
    });
    setRows(existingRows);
  }, [playerData, players]);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const addNewRow = () => {
    const newRow: InputRow = {
      id: `new-${Date.now()}`,
      playerId: "",
      playerName: "",
      date: getTodayDate(),
      speed: "",
      spinRate: "",
      trueSpin: "",
      spinEff: "",
      spinDirect: "",
      verticalBreak: "",
      horizontalBreak: "",
      rating: "",
      isNew: true,
      isExisting: false,
    };
    setRows([newRow, ...rows]);
  };

  const addExistingPlayerRow = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const newRow: InputRow = {
      id: `existing-${Date.now()}`,
      playerId: player.id,
      playerName: player.name,
      date: getTodayDate(),
      speed: "",
      spinRate: "",
      trueSpin: "",
      spinEff: "",
      spinDirect: "",
      verticalBreak: "",
      horizontalBreak: "",
      rating: "",
      isNew: false,
      isExisting: false,
    };
    setRows([newRow, ...rows]);
  };

  const removeRow = (id: string) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const updateRow = (id: string, field: keyof InputRow, value: string) => {
    setRows(rows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleSave = () => {
    if (onSaveData) {
      onSaveData(rows);
    }
    console.log("保存データ:", rows);
  };

  // 名前で検索してフィルタリング
  const filteredRows = searchName.trim() === ""
    ? rows
    : rows.filter(row => 
        row.playerName.toLowerCase().includes(searchName.toLowerCase())
      );

  // 検索結果を新規・既存で分けてソート
  const displayRows = [
    ...filteredRows.filter(r => !r.isExisting),
    ...filteredRows.filter(r => r.isExisting)
  ];

  return (
    <div className="graph-section">
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder={t("home.searchByName")}
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={{
            padding: '8px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
            minWidth: '200px',
          }}
        />

        <button
          onClick={addNewRow}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          {t("home.newPlayer")}
        </button>

        <select
          onChange={(e) => {
            if (e.target.value) {
              addExistingPlayerRow(e.target.value);
              e.target.value = "";
            }
          }}
          style={{
            padding: '8px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          <option value="">{t("analysis.selectPlayer")}</option>
          {players.map(player => (
            <option key={player.id} value={player.id}>
              {player.name}
            </option>
          ))}
        </select>

        {rows.length > 0 && (
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
              marginLeft: 'auto',
            }}
          >
            {t("common.save")}
          </button>
        )}

        {searchName && (
          <span style={{ color: '#6b7280', fontSize: '14px' }}>
            {t("dataTable.loading")}: {displayRows.length}件
          </span>
        )}
      </div>

      {displayRows.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
          {searchName ? t("home.noPlayers") : t("dataTable.noData")}
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
                <th style={headerStyle}>{t("analysis.playerName")}</th>
                <th style={headerStyle}>{t("analysis.date")}</th>
                <th style={headerStyle}>{t("analysis.speed")}</th>
                <th style={headerStyle}>{t("analysis.spin")}</th>
                <th style={headerStyle}>{t("analysis.trueSpin")}</th>
                <th style={headerStyle}>{t("analysis.spinEff")}</th>
                <th style={headerStyle}>SPIN DIRECT</th>
                <th style={headerStyle}>{t("analysis.verticalMovement")}</th>
                <th style={headerStyle}>{t("analysis.horizontalMovement")}</th>
                <th style={headerStyle}>{t("analysis.evaluation")}</th>
                <th style={headerStyle}>{t("common.delete")}</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, index) => (
                <tr 
                  key={row.id}
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb'
                  }}
                >
                  <td style={cellStyle}>
                    {row.isNew ? (
                      <input
                        type="text"
                        value={row.playerName}
                        onChange={(e) => updateRow(row.id, 'playerName', e.target.value)}
                        placeholder={t("createPlayer.name")}
                        style={inputStyle}
                      />
                    ) : (
                      <span style={{ fontWeight: row.isExisting ? '500' : 'normal' }}>
                        {row.playerName}
                      </span>
                    )}
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) => updateRow(row.id, 'date', e.target.value)}
                      style={{...inputStyle, backgroundColor: row.isExisting ? '#f9fafb' : 'white'}}
                      disabled={row.isExisting}
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="number"
                      value={row.speed}
                      onChange={(e) => updateRow(row.id, 'speed', e.target.value)}
                      style={{...inputStyle, backgroundColor: row.isExisting ? '#f9fafb' : 'white'}}
                      disabled={row.isExisting}
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="number"
                      value={row.spinRate}
                      onChange={(e) => updateRow(row.id, 'spinRate', e.target.value)}
                      style={{...inputStyle, backgroundColor: row.isExisting ? '#f9fafb' : 'white'}}
                      disabled={row.isExisting}
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="number"
                      value={row.trueSpin}
                      onChange={(e) => updateRow(row.id, 'trueSpin', e.target.value)}
                      style={{...inputStyle, backgroundColor: row.isExisting ? '#f9fafb' : 'white'}}
                      disabled={row.isExisting}
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="number"
                      value={row.spinEff}
                      onChange={(e) => updateRow(row.id, 'spinEff', e.target.value)}
                      style={{...inputStyle, backgroundColor: row.isExisting ? '#f9fafb' : 'white'}}
                      disabled={row.isExisting}
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="number"
                      value={row.spinDirect}
                      onChange={(e) => updateRow(row.id, 'spinDirect', e.target.value)}
                      style={{...inputStyle, backgroundColor: row.isExisting ? '#f9fafb' : 'white'}}
                      disabled={row.isExisting}
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="number"
                      value={row.verticalBreak}
                      onChange={(e) => updateRow(row.id, 'verticalBreak', e.target.value)}
                      style={{...inputStyle, backgroundColor: row.isExisting ? '#f9fafb' : 'white'}}
                      disabled={row.isExisting}
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="number"
                      value={row.horizontalBreak}
                      onChange={(e) => updateRow(row.id, 'horizontalBreak', e.target.value)}
                      style={{...inputStyle, backgroundColor: row.isExisting ? '#f9fafb' : 'white'}}
                      disabled={row.isExisting}
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="text"
                      value={row.rating}
                      onChange={(e) => updateRow(row.id, 'rating', e.target.value)}
                      style={{...inputStyle, backgroundColor: row.isExisting ? '#f9fafb' : 'white'}}
                      disabled={row.isExisting}
                    />
                  </td>
                  <td style={cellStyle}>
                    <button
                      onClick={() => removeRow(row.id)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      {t("common.delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  padding: '12px 8px',
  textAlign: 'center',
  fontWeight: '600',
  color: '#374151',
  borderRight: '1px solid #d1d5db',
};

const cellStyle: React.CSSProperties = {
  padding: '10px 8px',
  textAlign: 'center',
  borderRight: '1px solid #e5e7eb',
  color: '#111827',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontSize: '14px',
  textAlign: 'center',
};