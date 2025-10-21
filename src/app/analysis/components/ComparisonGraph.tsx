"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { useLanguage } from "@/contexts/LanguageContext";
import { PlayerData, Player } from "../types";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface ComparisonGraphProps {
  players: Player[];
  playerData: PlayerData[];
  selectedPlayers: string[];
}

export default function ComparisonGraph({
  players,
  playerData,
  selectedPlayers,
}: ComparisonGraphProps) {
  const { t } = useLanguage();

  if (selectedPlayers.length === 0) {
    return (
      <div className="graph-section">
        <p className="no-data-message">{t("analysis.noPlayerSelected")}</p>
      </div>
    );
  }

  // Prepare average speed data
  const avgSpeedData = selectedPlayers.map(playerId => {
    const player = players.find(p => p.id === playerId);
    const stats = playerData.filter(d => d.id === playerId);
    const avgSpeed = stats.length > 0
      ? stats.reduce((sum, s) => sum + s.speed, 0) / stats.length
      : 0;
    return {
      name: player?.name || "Unknown",
      value: parseFloat(avgSpeed.toFixed(1)),
    };
  });

  // Prepare max speed data
  const maxSpeedData = selectedPlayers.map(playerId => {
    const player = players.find(p => p.id === playerId);
    const stats = playerData.filter(d => d.id === playerId);
    const maxSpeed = stats.length > 0 ? Math.max(...stats.map(s => s.speed)) : 0;
    return {
      name: player?.name || "Unknown",
      value: parseFloat(maxSpeed.toFixed(1)),
    };
  });

  // Prepare average spin data
  const avgSpinData = selectedPlayers.map(playerId => {
    const player = players.find(p => p.id === playerId);
    const stats = playerData.filter(d => d.id === playerId);
    const avgSpin = stats.length > 0
      ? stats.reduce((sum, s) => sum + s.spin, 0) / stats.length
      : 0;
    return {
      name: player?.name || "Unknown",
      value: Math.round(avgSpin),
    };
  });

  // Prepare radar chart data
  const prepareRadarData = () => {
    const subjects = [
      t("analysis.averageSpeed"),
      t("analysis.averageSpin"),
      t("analysis.averageTrueSpin"),
      t("analysis.averageSpinEff"),
      t("analysis.strikeRate")
    ];

    // Calculate max values for normalization
    const allStats = playerData.filter(d => selectedPlayers.includes(d.id));
    const maxValues = {
      speed: Math.max(...allStats.map(d => d.speed), 1),
      spin: Math.max(...allStats.map(d => d.spin), 1),
      trueSpin: Math.max(...allStats.map(d => d.trueSpin), 1),
      spinEff: 100,
      strike: 100
    };

    return subjects.map(subject => {
      const dataPoint: any = { subject };

      selectedPlayers.slice(0, 5).forEach(playerId => {
        const stats = playerData.filter(data => data.id === playerId);
        if (stats.length > 0) {
          let value = 0;
          switch (subject) {
            case t("analysis.averageSpeed"):
              value = (stats.reduce((sum, item) => sum + item.speed, 0) / stats.length) / maxValues.speed * 100;
              break;
            case t("analysis.averageSpin"):
              value = (stats.reduce((sum, item) => sum + item.spin, 0) / stats.length) / maxValues.spin * 100;
              break;
            case t("analysis.averageTrueSpin"):
              value = (stats.reduce((sum, item) => sum + item.trueSpin, 0) / stats.length) / maxValues.trueSpin * 100;
              break;
            case t("analysis.averageSpinEff"):
              value = (stats.reduce((sum, item) => sum + item.spinEff, 0) / stats.length);
              break;
            case t("analysis.strikeRate"):
              value = (stats.reduce((sum, item) => sum + item.strike, 0) / stats.length) * 100;
              break;
          }
          dataPoint[playerId] = Math.round(value);
        }
      });

      return dataPoint;
    });
  };

  return (
    <div className="graph-section">
      <h3 className="graph-title">{t("analysis.tabs.comparison")}</h3>

      {/* Average Speed Chart */}
      <div className="graph-item">
        <h4 className="chart-subtitle">{t("analysis.averageSpeedByPlayer")}</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={avgSpeedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis
              stroke="#666"
              label={{ value: t("common.kph"), angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill={COLORS[0]} name={t("analysis.averageSpeed")} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Max Speed Chart */}
      <div className="graph-item">
        <h4 className="chart-subtitle">{t("analysis.maxSpeedByPlayer")}</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={maxSpeedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis
              stroke="#666"
              label={{ value: t("common.kph"), angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill={COLORS[1]} name={t("analysis.maxSpeed")} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Average Spin Chart */}
      <div className="graph-item">
        <h4 className="chart-subtitle">{t("analysis.averageSpinByPlayer")}</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={avgSpinData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis
              stroke="#666"
              label={{ value: t("common.rpm"), angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill={COLORS[2]} name={t("analysis.averageSpin")} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar Chart */}
      <div className="graph-item">
        <h4 className="chart-subtitle">{t("analysis.performanceRadar")}</h4>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={prepareRadarData()}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Tooltip />
            <Legend />
            {selectedPlayers.slice(0, 5).map((playerId, index) => {
              const player = players.find(p => p.id === playerId);
              return (
                <Radar
                  key={playerId}
                  name={player?.name || "Unknown"}
                  dataKey={playerId}
                  stroke={COLORS[index]}
                  fill={COLORS[index]}
                  fillOpacity={0.3}
                />
              );
            })}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Comparison Table */}
      <div className="comparison-table">
        <h4 className="chart-subtitle">{t("analysis.detailedComparison")}</h4>
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("analysis.playerName")}</th>
              <th>{t("analysis.averageSpeed")}</th>
              <th>{t("analysis.maxSpeed")}</th>
              <th>{t("analysis.averageSpin")}</th>
              <th>{t("analysis.maxSpin")}</th>
              <th>{t("analysis.averageTrueSpin")}</th>
              <th>{t("analysis.averageSpinEff")}</th>
              <th>{t("analysis.strikeRate")}</th>
            </tr>
          </thead>
          <tbody>
            {selectedPlayers.map(playerId => {
              const player = players.find(p => p.id === playerId);
              const stats = playerData.filter(d => d.id === playerId);
              if (stats.length === 0) return null;

              const avgSpeed = stats.reduce((sum, s) => sum + s.speed, 0) / stats.length;
              const maxSpeed = Math.max(...stats.map(s => s.speed));
              const avgSpin = stats.reduce((sum, s) => sum + s.spin, 0) / stats.length;
              const maxSpin = Math.max(...stats.map(s => s.spin));
              const avgTrueSpin = stats.reduce((sum, s) => sum + s.trueSpin, 0) / stats.length;
              const avgSpinEff = stats.reduce((sum, s) => sum + s.spinEff, 0) / stats.length;
              const strikeRate = (stats.filter(s => s.strike === 1).length / stats.length) * 100;

              return (
                <tr key={playerId}>
                  <td>{player?.name || "Unknown"}</td>
                  <td>{avgSpeed.toFixed(1)} {t("common.kph")}</td>
                  <td>{maxSpeed.toFixed(1)} {t("common.kph")}</td>
                  <td>{Math.round(avgSpin)} {t("common.rpm")}</td>
                  <td>{Math.round(maxSpin)} {t("common.rpm")}</td>
                  <td>{Math.round(avgTrueSpin)} {t("common.rpm")}</td>
                  <td>{avgSpinEff.toFixed(1)}{t("common.percent")}</td>
                  <td>{strikeRate.toFixed(1)}{t("common.percent")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
