import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import BoxScoreRow from './BoxScoreRow';
import {STAT_COLUMNS} from '../constants/STAT_COLUMNS'

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
