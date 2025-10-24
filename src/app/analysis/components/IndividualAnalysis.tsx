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

  // 最新のデータの日付を取得
  const latestDate = filteredData[filteredData.length - 1].date;
  const dateObj = new Date(latestDate);
  const formattedDate = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;

  // グラフ用データ
  const speedChartData = filteredData.map((data, index) => ({
    name: `${data.date.split('-')[1]}/${data.date.split('-')[2]}`,
    value: data.speed
  }));

  const spinChartData = filteredData.map((data, index) => ({
    name: `${data.date.split('-')[1]}/${data.date.split('-')[2]}`,
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

  // 散布図のサイズ計算
  const plotWidth = 480.5;
  const plotHeight = 311.16;

  return (
    <div className="container">
      <div className="mainLayout">
        {/* 上段: グラフ2つ */}
        <div className="graphRow">
          {/* 球速グラフ */}
          <div className="chartCard">
            <h3 className="chartTitle">
              速度<br />(km/h)
            </h3>
            
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={speedChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  label={{ value: '日付or回目', position: 'insideBottomRight', offset: -5, fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#e74c3c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 回転数グラフ */}
          <div className="chartCard">
            <h3 className="chartTitle">
              回転数
            </h3>
            
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={spinChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  label={{ value: '日付or回目', position: 'insideBottomRight', offset: -5, fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#667eea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 中段: カード3つ */}
        <div className="cardsRow">
          {/* 球速(平均) */}
          <div className="valueCard">
            <h3 className="valueTitle">球速(平均)</h3>
            <p className="dateText">{formattedDate}</p>
            <div className="speedValue">
              {avgSpeed.toFixed(0)}km/h
            </div>
          </div>

          {/* 回転数(平均) */}
          <div className="valueCard">
            <h3 className="valueTitle">回転数(平均)</h3>
            <div className="spinValue">
              {Math.round(avgSpin)}
            </div>
          </div>

          {/* ストライク率 */}
          <div className="strikeCard">
            <h3 className="strikeTitle">
              ストライク率
            </h3>
            
            <div className="circleContainer">
              <svg width="200" height="200" className="circleSvg">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#f0f0f0"
                  strokeWidth="20"
                />
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
        </div>

        {/* 下段: 散布図（3列目に配置） */}
        <div className="scatterRow">
          {/* 散布図 */}
          <div className="scatterCard">
            <div className="scatterPlot">
              <span className="scatterAxisLabel scatterAxisLabelLeft">速度</span>
              <span className="scatterAxisLabel scatterAxisLabelBottom">回転数</span>
              
              {scatterData.map((point, index) => {
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
            <div className="scatterSize">
              {plotWidth.toFixed(1)} × {plotHeight.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}