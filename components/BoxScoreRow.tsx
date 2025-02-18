import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { STAT_COLUMNS } from '../constants/STAT_COLUMNS'; // or wherever STAT_COLUMNS is defined

interface BoxScoreRowProps {
  shirtNumber?: number;
  name: string;
  isCaptain?: boolean;
  isStarter?: boolean;
  position?: string;
  stats: { [key: string]: any };
  isSeparator?: boolean;
}

const BoxScoreRow: React.FC<BoxScoreRowProps> = ({
  shirtNumber,
  name,
  isCaptain,
  isStarter,
  position,
  stats,
  isSeparator = false,
}) => {
  const displayPlayerName = isCaptain ? `${name} (C)` : name;

  return (
    <View
      style={[
        styles.row,
        isSeparator && styles.starterSeparator, // Add separator if it's the first bench player
      ]}
    >
      {/* Shirt number */}
      <Text style={[styles.cell, { width: 40 }]}>
        {shirtNumber ?? '-'}
      </Text>

      {/* Player name */}
      <Text
        style={[styles.cell, { width: 120, flexWrap: 'wrap' }]}
        numberOfLines={4}
        ellipsizeMode="clip"
      >
        {displayPlayerName}
      </Text>

      {/* Player position */}
      <Text style={[styles.cell, { width: 60 }]}>
        {position ?? '-'}
      </Text>

      {/* Render each statistical column using STAT_COLUMNS for consistent order */}
      {STAT_COLUMNS.map((col) => (
        <Text
          key={col.key}
          style={[styles.cell, { width: col.width }]}
        >
          {stats[col.key] ?? '-'}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  starterSeparator: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  cell: {
    textAlign: 'left',
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontSize: 12,
    color: '#333',
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
});

export default BoxScoreRow;
