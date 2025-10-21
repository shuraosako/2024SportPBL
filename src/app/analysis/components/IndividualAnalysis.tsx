"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from "@/contexts/LanguageContext";
import { PlayerData, Player } from "../types";

const COLORS = {
  primary: "#2563eb",
  secondary: "#10b981",
  tertiary: "#f59e0b",
};

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
      <div className="graph-section">
        <p className="no-data-message">{t("analysis.noPlayerSelected")}</p>
      </div>
    );
  }

  const player = players.find(p => p.id === selectedPlayer);
  const filteredData = playerData
    .filter(data => data.id === selectedPlayer)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (filteredData.length === 0) {
    return (
      <div className="graph-section">
        <h3 className="graph-title">
          {player?.name || t("analysis.selectPlayer")}
        </h3>
        <p className="no-data-message">{t("analysis.noData")}</p>
      </div>
    );
  }

  // Calculate statistics
  const speeds = filteredData.map(d => d.speed);
  const spins = filteredData.map(d => d.spin);
  const trueSpins = filteredData.map(d => d.trueSpin);
  const spinEffs = filteredData.map(d => d.spinEff);
  const strikes = filteredData.filter(d => d.strike === 1).length;

  const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  const maxSpeed = Math.max(...speeds);
  const minSpeed = Math.min(...speeds);
  const avgSpin = spins.reduce((a, b) => a + b, 0) / spins.length;
  const maxSpin = Math.max(...spins);
  const avgTrueSpin = trueSpins.reduce((a, b) => a + b, 0) / trueSpins.length;
  const avgSpinEff = spinEffs.reduce((a, b) => a + b, 0) / spinEffs.length;
  const strikeRate = (strikes / filteredData.length) * 100;

  // Prepare chart data
  const chartData = filteredData.map(data => ({
    date: new Date(data.date).toLocaleDateString(),
    speed: data.speed,
    spin: data.spin,
    strikeRate: data.strike * 100,
  }));

  return (
    <div className="graph-section">
      <h3 className="graph-title">
        {player?.name || t("analysis.selectPlayer")} - {t("analysis.tabs.individual")}
      </h3>

      {/* Statistics Cards */}
      <div className="statistics-grid">
        <div className="stat-card">
          <div className="stat-label">{t("analysis.averageSpeed")}</div>
          <div className="stat-value">{avgSpeed.toFixed(1)} {t("common.kph")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t("analysis.maxSpeed")}</div>
          <div className="stat-value">{maxSpeed.toFixed(1)} {t("common.kph")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t("analysis.minSpeed")}</div>
          <div className="stat-value">{minSpeed.toFixed(1)} {t("common.kph")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t("analysis.averageSpin")}</div>
          <div className="stat-value">{Math.round(avgSpin)} {t("common.rpm")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t("analysis.maxSpin")}</div>
          <div className="stat-value">{Math.round(maxSpin)} {t("common.rpm")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t("analysis.averageTrueSpin")}</div>
          <div className="stat-value">{Math.round(avgTrueSpin)} {t("common.rpm")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t("analysis.averageSpinEff")}</div>
          <div className="stat-value">{avgSpinEff.toFixed(1)}{t("common.percent")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t("analysis.strikeRate")}</div>
          <div className="stat-value">{strikeRate.toFixed(1)}{t("common.percent")}</div>
        </div>
      </div>

      {/* Speed Chart */}
      <div className="graph-item">
        <h4 className="chart-subtitle">{t("analysis.speedChart")}</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis
              stroke={COLORS.primary}
              label={{ value: t("common.kph"), angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="speed"
              stroke={COLORS.primary}
              name={t("analysis.speed")}
              dot={true}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Spin Chart */}
      <div className="graph-item">
        <h4 className="chart-subtitle">{t("analysis.spinChart")}</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis
              stroke={COLORS.secondary}
              label={{ value: t("common.rpm"), angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="spin"
              stroke={COLORS.secondary}
              name={t("analysis.spin")}
              dot={true}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Strike Rate Chart */}
      <div className="graph-item">
        <h4 className="chart-subtitle">{t("analysis.strikeRateChart")}</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis
              stroke={COLORS.tertiary}
              label={{ value: t("common.percent"), angle: -90, position: 'insideLeft' }}
              domain={[0, 100]}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="strikeRate"
              stroke={COLORS.tertiary}
              name={t("analysis.strikeRate")}
              dot={true}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
