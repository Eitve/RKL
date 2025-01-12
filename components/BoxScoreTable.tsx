// components/BoxScoreTable.tsx

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import BoxScoreRow from './BoxScoreRow';

interface STAT_COLUMNS {
  key: string;
  label: string;
  width: number;
}

interface BoxScoreTableProps {
  teamName: string;
  boxScoreRows: BoxScoreRowData[];
}

interface BoxScoreRowData {
  shirtNumber?: number;
  name: string;
  isCaptain?: boolean;
  isStarter?: boolean;
  position?: string;
  stats: { [key: string]: any };
}

const STAT_COLUMNS: STAT_COLUMNS[] = [
  { key: 'Mins', label: 'Mins', width: 50 },
  { key: 'PTS', label: 'PTS', width: 50 },
  { key: 'FG', label: 'FG', width: 50 },
  { key: 'FGA', label: 'FGA', width: 50 },
  { key: 'FGpct', label: 'FG%', width: 50 },
  { key: '2PM', label: '2PM', width: 50 },
  { key: '2PA', label: '2PA', width: 50 },
  { key: 'twoPTpct', label: '2PT%', width: 50 },
  { key: '3PM', label: '3PM', width: 50 },
  { key: '3PA', label: '3PA', width: 50 },
  { key: 'threePTpct', label: '3PT%', width: 50 },
  { key: 'FTM', label: 'FTM', width: 50 },
  { key: 'FTA', label: 'FTA', width: 50 },
  { key: 'FTpct', label: 'FT%', width: 50 },
  { key: 'REB', label: 'REB', width: 50 },
  { key: 'AST', label: 'AST', width: 50 },
  { key: 'STL', label: 'STL', width: 50 },
  { key: 'BLK', label: 'BLK', width: 50 },
  { key: 'TOV', label: 'TOV', width: 50 },
  { key: 'PF', label: 'PF', width: 50 },
  { key: 'PLUSMINUS', label: '+/-', width: 50 },
];

const BoxScoreTable: React.FC<BoxScoreTableProps> = ({ teamName, boxScoreRows }) => {
  if (boxScoreRows.length === 0) {
    return (
      <View style={styles.boxScoreContainer}>
        <Text style={styles.tableTitle}>{teamName} Box Score</Text>
        <Text style={{ marginLeft: 16 }}>No box score data.</Text>
      </View>
    );
  }

  // Find the index where bench players start to insert a separator
  const firstBenchPlayerIndex = boxScoreRows.findIndex((player) => !player.isStarter);

  return (
    <View style={styles.boxScoreContainer}>
      <Text style={styles.tableTitle}>{teamName} Box Score</Text>

      <ScrollView
        horizontal
        style={styles.tableWrapper}
        showsHorizontalScrollIndicator
      >
        <View>
          {/* Header row for the box score table */}
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.headerCell, { width: 40 }]}>#</Text>
            <Text style={[styles.headerCell, { width: 120 }]}>Name</Text>
            <Text style={[styles.headerCell, { width: 60 }]}>Pos</Text>
            {STAT_COLUMNS.map((statColumn) => (
              <Text
                key={statColumn.key}
                style={[styles.headerCell, { width: statColumn.width }]}
              >
                {statColumn.label}
              </Text>
            ))}
          </View>

          {/* Render each player's statistics */}
          {boxScoreRows.map((playerRow, index) => {
            const isSeparator = index === firstBenchPlayerIndex && firstBenchPlayerIndex > 0;

            return (
              <BoxScoreRow
                key={`${playerRow.name}-${index}`}
                shirtNumber={playerRow.shirtNumber}
                name={playerRow.name}
                isCaptain={playerRow.isCaptain}
                isStarter={playerRow.isStarter}
                position={playerRow.position}
                stats={playerRow.stats}
                isSeparator={isSeparator}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  boxScoreContainer: {
    marginBottom: 20,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
    marginBottom: 6,
  },
  tableWrapper: {
    marginHorizontal: 10,
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerRow: {
    backgroundColor: '#eee',
    borderBottomWidth: 2,
    borderBottomColor: '#999',
  },
  headerCell: {
    textAlign: 'center',
    fontWeight: 'bold',
    paddingVertical: 6,
    paddingHorizontal: 2,
    fontSize: 12,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
});

export default BoxScoreTable;
