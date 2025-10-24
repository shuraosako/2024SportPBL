"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { PlayerData, Player } from "../types";
import { useState } from "react";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface WholeProps {
  players: Player[];
  playerData: PlayerData[];
  onSaveData?: (data: any[]) => void; // 保存用コールバック
}

interface InputRow {
  id: string;
  playerId: string;
  playerName: string;
  speed: string;
  spinRate: string;
  trueSpin: string;
  spinEff: string;
  spinDirect: string;
  verticalBreak: string;
  horizontalBreak: string;
  rating: string;
  isNew: boolean;
}

export default function Whole({
  players,
  playerData,
  onSaveData,
}: WholeProps) {
  const { t } = useLanguage();
  
  const [rows, setRows] = useState<InputRow[]>([]);

  // 新規行を追加
  const addNewRow = () => {
    const newRow: InputRow = {
      id: `new-${Date.now()}`,
      playerId: "",
      playerName: "",
      speed: "",
      spinRate: "",
      trueSpin: "",
      spinEff: "",
      spinDirect: "",
      verticalBreak: "",
      horizontalBreak: "",
      rating: "",
      isNew: true,
    };
    setRows([...rows, newRow]);
  };

  // 既存プレイヤーの行を追加
  const addExistingPlayerRow = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const newRow: InputRow = {
      id: `existing-${Date.now()}`,
      playerId: player.id,
      playerName: player.name,
      speed: "",
      spinRate: "",
      trueSpin: "",
      spinEff: "",
      spinDirect: "",
      verticalBreak: "",
      horizontalBreak: "",
      rating: "",
      isNew: false,
    };
    setRows([...rows, newRow]);
  };

  // 行を削除
  const removeRow = (id: string) => {
    setRows(rows.filter(row => row.id !== id));
  };

  // 入力値を更新
  const updateRow = (id: string, field: keyof InputRow, value: string) => {
    setRows(rows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  // データを保存
  const handleSave = () => {
    if (onSaveData) {
      onSaveData(rows);
    }
    console.log("保存データ:", rows);
  };

  return (
    <div className="graph-section">
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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
          新規プレイヤー追加
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
          <option value="">既存プレイヤーを選択</option>
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
            保存
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
          プレイヤーを追加してデータを入力してください
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
                <th style={headerStyle}>選手名</th>
                <th style={headerStyle}>球速</th>
                <th style={headerStyle}>回転数</th>
                <th style={headerStyle}>TRUE SPIN</th>
                <th style={headerStyle}>SPIN EFF.</th>
                <th style={headerStyle}>SPIN DIRECT</th>
                <th style={headerStyle}>縦の変化量</th>
                <th style={headerStyle}>横の変化量</th>
                <th style={headerStyle}>評価</th>
                <th style={headerStyle}>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
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
                        placeholder="名前を入力"
                        style={inputStyle}
                      />
                    ) : (
                      <span>{row.playerName}</span>
                    )}
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="number"
                      value={row.speed}
                      onChange={(e) => updateRow(row.id, 'speed', e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="number"
                      value={row.spinRate}
                      onChange={(e) => updateRow(row.id, 'spinRate', e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="number"
                      value={row.trueSpin}
                      onChange={(e) => updateRow(row.id, 'trueSpin', e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="number"
                      value={row.spinEff}
                      onChange={(e) => updateRow(row.id, 'spinEff', e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="number"
                      value={row.spinDirect}
                      onChange={(e) => updateRow(row.id, 'spinDirect', e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="number"
                      value={row.verticalBreak}
                      onChange={(e) => updateRow(row.id, 'verticalBreak', e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="number"
                      value={row.horizontalBreak}
                      onChange={(e) => updateRow(row.id, 'horizontalBreak', e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                  <td style={cellStyle}>
                    <input
                      type="text"
                      value={row.rating}
                      onChange={(e) => updateRow(row.id, 'rating', e.target.value)}
                      style={inputStyle}
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
                      削除
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