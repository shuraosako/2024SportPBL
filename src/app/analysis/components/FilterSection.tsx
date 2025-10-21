"use client";

import DatePicker from "react-datepicker";
import { useLanguage } from "@/contexts/LanguageContext";
import { Player } from "../types";

interface FilterSectionProps {
  startDate: Date | null;
  endDate: Date | null;
  showAllPeriod: boolean;
  players: Player[];
  selectedPlayer: string | null;
  selectedPlayers: string[];
  currentTab: "individual" | "comparison";
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onShowAllPeriodChange: (show: boolean) => void;
  onPlayerSelect: (playerId: string) => void;
  onPlayersSelect: (playerIds: string[]) => void;
}

export default function FilterSection({
  startDate,
  endDate,
  showAllPeriod,
  players,
  selectedPlayer,
  selectedPlayers,
  currentTab,
  onStartDateChange,
  onEndDateChange,
  onShowAllPeriodChange,
  onPlayerSelect,
  onPlayersSelect,
}: FilterSectionProps) {
  const { t } = useLanguage();

  const handlePlayerCheckboxChange = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      onPlayersSelect(selectedPlayers.filter((id) => id !== playerId));
    } else {
      if (selectedPlayers.length < 5) {
        onPlayersSelect([...selectedPlayers, playerId]);
      }
    }
  };

  return (
    <div className="filter-section">
      {/* Date Filter */}
      <div className="date-filter">
        <DatePicker
          selected={startDate}
          onChange={onStartDateChange}
          selectsStart
          startDate={startDate || undefined}
          endDate={endDate || undefined}
          placeholderText={t("analysis.startDate")}
          dateFormat="yyyy/MM/dd"
          className="date-picker"
          disabled={showAllPeriod}
        />
        <DatePicker
          selected={endDate}
          onChange={onEndDateChange}
          selectsEnd
          startDate={startDate || undefined}
          endDate={endDate || undefined}
          minDate={startDate || undefined}
          placeholderText={t("analysis.endDate")}
          dateFormat="yyyy/MM/dd"
          className="date-picker"
          disabled={showAllPeriod}
        />
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showAllPeriod}
            onChange={(e) => onShowAllPeriodChange(e.target.checked)}
          />
          <span>{t("analysis.allPeriod")}</span>
        </label>
      </div>

      {/* Player Selection */}
      {currentTab === "individual" ? (
        <div className="player-selection">
          <label>{t("analysis.selectPlayer")}:</label>
          <select
            value={selectedPlayer || ""}
            onChange={(e) => onPlayerSelect(e.target.value)}
            className="player-select"
          >
            <option value="">{t("analysis.selectPlayer")}</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="player-selection">
          <label>{t("analysis.selectPlayers")}:</label>
          <div className="player-checkboxes">
            {players.map((player) => (
              <label key={player.id} className="player-checkbox">
                <input
                  type="checkbox"
                  checked={selectedPlayers.includes(player.id)}
                  onChange={() => handlePlayerCheckboxChange(player.id)}
                  disabled={!selectedPlayers.includes(player.id) && selectedPlayers.length >= 5}
                />
                <span>{player.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
