"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from "@/contexts/LanguageContext";
import { PlayerData, Player } from "../types";
import './IndividualAnalysis.css';

interface IndividualAnalysisProps {
  selectedPlayer: string | null;
  players: Player[];
  playerData: PlayerData[];
}

export default function IndividualAnalysis({
  selectedPlayer,
  players,
  playerData,
}: IndividualAnalysisProps) {
  const { t } = useLanguage();

  if (!selectedPlayer) {
    return (
      <div className="noDataContainer">
        <p>{t("analysis.noPlayerSelected")}</p>
      </div>
    );
  }

  const player = players.find(p => p.id === selectedPlayer);
  const filteredData = playerData
    .filter(data => data.id === selectedPlayer)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (filteredData.length === 0) {
    return (
      <div className="noDataWithTitle">
        <h3>{player?.name || t("analysis.selectPlayer")}</h3>
        <p>{t("analysis.noData")}</p>
      </div>
    );
  }

  // Calculate statistics
  const speeds = filteredData.map(d => d.speed);
  const spins = filteredData.map(d => d.spin);
  const strikes = filteredData.filter(d => d.strike === 1).length;
  
  const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  const avgSpin = spins.reduce((a, b) => a + b, 0) / spins.length;
  const strikeRate = (strikes / filteredData.length) * 100;

  // グラフ用データ
  const speedChartData = filteredData.map((data, index) => ({
    name: `${index + 1}`,
    value: data.speed
  }));

  const spinChartData = filteredData.map((data, index) => ({
    name: `${index + 1}`,
    value: data.spin
  }));

  // 散布図用データ
  const scatterData = filteredData.map(data => ({
    speed: data.speed,
    spin: data.spin
  }));

  // 散布図の範囲を自動計算
  const minSpeed = Math.min(...speeds);
  const maxSpeed = Math.max(...speeds);
  const minSpin = Math.min(...spins);
  const maxSpin = Math.max(...spins);

  return (
    <div className="container">
      {/* グリッドレイアウト */}
      <div className="gridLayout">
        {/* 左上: 球速統計 */}
        <div className="card">
          <h3 className="cardTitle">
            {t("analysis.averageSpeed")}
          </h3>
          <div className="speedValue">
            {avgSpeed.toFixed(0)}{t("common.kph")}
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={speedChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#667eea" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 右上: 回転数統計 */}
        <div className="card">
          <h3 className="cardTitle">
            {t("analysis.averageSpin")}
          </h3>
          <div className="spinValue">
            {Math.round(avgSpin)}
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={spinChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#e74c3c" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 左下: ストライク率 */}
        <div className="strikeCard">
          <h3 className="strikeTitle">
            {t("analysis.strikeRate")}
          </h3>
          
          {/* 円グラフ風の表示 */}
          <div className="circleContainer">
            <svg width="200" height="200" className="circleSvg">
              {/* 背景の円 */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#f0f0f0"
                strokeWidth="20"
              />
              {/* ストライク率の円 */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#f1c40f"
                strokeWidth="20"
                strokeDasharray={`${2 * Math.PI * 80 * (strikeRate / 100)} ${2 * Math.PI * 80}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="strikeRateValue">
              {strikeRate.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* 右下: 速度と回転数の関係 */}
        <div className="card">
          <div className="scatterHeader">
            <h3 className="scatterTitle">
              {t("analysis.speed")}
            </h3>
            <h3 className="scatterTitle">
              {t("analysis.spin")}
            </h3>
          </div>
          
          {/* 散布図風の表示 */}
          <div className="scatterPlot">
            {scatterData.map((point, index) => {
              // 座標を正規化
              const speedRange = maxSpeed - minSpeed || 1;
              const spinRange = maxSpin - minSpin || 1;
              const x = ((point.speed - minSpeed) / speedRange) * 90 + 5;
              const y = 100 - ((point.spin - minSpin) / spinRange) * 90;
              
              return (
                <div
                  key={index}
                  className="scatterDot"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}