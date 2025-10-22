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

  // Prepare horizontal bar chart data
  const prepareHorizontalBarData = () => {
    const metrics = [
      { key: 'avgSpeed', label: t("analysis.averageSpeed") },
      { key: 'maxSpeed', label: t("analysis.maxSpeed") },
      { key: 'avgSpin', label: t("analysis.averageSpin") },
      { key: 'avgTrueSpin', label: t("analysis.averageTrueSpin") },
      { key: 'avgSpinEff', label: t("analysis.averageSpinEff") },
      { key: 'strikeRate', label: t("analysis.strikeRate") }
    ];

    return metrics.map(metric => {
      const dataPoint: any = { metric: metric.label };

      selectedPlayers.slice(0, 5).forEach(playerId => {
        const stats = playerData.filter(data => data.id === playerId);
        if (stats.length > 0) {
          let value = 0;
          switch (metric.key) {
            case 'avgSpeed':
              value = stats.reduce((sum, item) => sum + item.speed, 0) / stats.length;
              break;
            case 'maxSpeed':
              value = Math.max(...stats.map(s => s.speed));
              break;
            case 'avgSpin':
              value = stats.reduce((sum, item) => sum + item.spin, 0) / stats.length;
              break;
            case 'avgTrueSpin':
              value = stats.reduce((sum, item) => sum + item.trueSpin, 0) / stats.length;
              break;
            case 'avgSpinEff':
              value = stats.reduce((sum, item) => sum + item.spinEff, 0) / stats.length;
              break;
            case 'strikeRate':
              value = (stats.filter(s => s.strike === 1).length / stats.length) * 100;
              break;
          }
          dataPoint[playerId] = parseFloat(value.toFixed(1));
        }
      });

      return dataPoint;
    });
  };

  return (
    <div className="graph-section">
      <h3 className="graph-title">{t("analysis.tabs.comparison")}</h3>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
        {/* Player Avatars Section */}
        <div style={{ 
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid #e0e0e0'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold' }}>
            {t("analysis.players")}
          </h4>
          {selectedPlayers.slice(0, 5).map((playerId, index) => {
            const player = players.find(p => p.id === playerId);
            return (
              <div key={playerId} style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  backgroundColor: COLORS[index], 
                  border: `3px solid ${COLORS[index]}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>
                  {player?.name.charAt(0)}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '500', textAlign: 'center' }}>
                  {player?.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Horizontal Bar Chart Comparison */}
        <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', padding: '20px' }}>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart 
              data={prepareHorizontalBarData()} 
              layout="vertical"
              margin={{ left: 150, right: 30, top: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                stroke="#666" 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#ccc' }}
              />
              <YAxis 
                type="category" 
                dataKey="metric" 
                stroke="#666" 
                width={145} 
                tick={{ fontSize: 13, fill: '#333' }}
                axisLine={{ stroke: '#ccc' }}
                tickLine={{ stroke: '#ccc' }}
              />
              <Tooltip 
                contentStyle={{ fontSize: 12 }}
                formatter={(value: any) => [parseFloat(value).toFixed(1), '']}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              {selectedPlayers.map((playerId, index) => {
                const player = players.find(p => p.id === playerId);
                return (
                  <Bar
                    key={playerId}
                    dataKey={playerId}
                    fill={COLORS[index]}
                    name={player?.name || "Unknown"}
                    radius={[0, 4, 4, 0]}
                    barSize={30}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Individual Radar Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {selectedPlayers.slice(0, 5).map((playerId, index) => {
          const player = players.find(p => p.id === playerId);
          const stats = playerData.filter(d => d.id === playerId);
          
          if (stats.length === 0) return null;

          // Calculate individual radar data
          const allStats = playerData.filter(d => selectedPlayers.includes(d.id));
          const maxValues = {
            speed: Math.max(...allStats.map(d => d.speed), 1),
            spin: Math.max(...allStats.map(d => d.spin), 1),
            trueSpin: Math.max(...allStats.map(d => d.trueSpin), 1),
          };

          const individualRadarData = [
            {
              subject: t("analysis.averageSpeed"),
              value: Math.round((stats.reduce((sum, s) => sum + s.speed, 0) / stats.length) / maxValues.speed * 100),
              fullMark: 100
            },
            {
              subject: t("analysis.averageSpin"),
              value: Math.round((stats.reduce((sum, s) => sum + s.spin, 0) / stats.length) / maxValues.spin * 100),
              fullMark: 100
            },
            {
              subject: t("analysis.averageTrueSpin"),
              value: Math.round((stats.reduce((sum, s) => sum + s.trueSpin, 0) / stats.length) / maxValues.trueSpin * 100),
              fullMark: 100
            },
            {
              subject: t("analysis.averageSpinEff"),
              value: Math.round(stats.reduce((sum, s) => sum + s.spinEff, 0) / stats.length),
              fullMark: 100
            },
            {
              subject: t("analysis.strikeRate"),
              value: Math.round((stats.filter(s => s.strike === 1).length / stats.length) * 100),
              fullMark: 100
            }
          ];

          return (
            <div key={playerId} style={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: '12px', 
              padding: '20px',
              backgroundColor: '#fff'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid #e0e0e0'
              }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  backgroundColor: COLORS[index], 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  {player?.name.charAt(0)}
                </div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{player?.name}</h4>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={individualRadarData}>
                  <PolarGrid stroke="#e0e0e0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#666' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                  <Radar
                    dataKey="value"
                    stroke={COLORS[index]}
                    fill={COLORS[index]}
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          );
        })}
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