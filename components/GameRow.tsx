import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { GameStats } from '../types';

interface GameRowProps {
  game: GameStats;
  onPress: (gameID: string) => void;
}

const GameRow: React.FC<GameRowProps> = ({ game, onPress }) => {
  const resultColor = game.isWin ? 'green' : 'red';
  const resultLabel = game.isWin ? 'W' : 'L';

  return (
    <TouchableOpacity onPress={() => onPress(game.gameID)} style={styles.gameRow}>
      <Text style={styles.opponentLine}>
        <Text style={styles.bold}>{game.opponentTeamName}</Text>{' '}
        <Text>{game.finalScore}</Text>{'  '}
        <Text style={[styles.bold, { color: resultColor }]}>{resultLabel}</Text>
      </Text>
      <Text style={styles.statsLine}>
        PTS: {game.points}, REB: {game.rebounds}, AST: {game.assists},
        {'  '}STL: {game.steals}, BLK: {game.blocks}, MINS: {game.minutes}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gameRow: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  opponentLine: {
    marginBottom: 2,
    fontSize: 14,
  },
  statsLine: {
    fontSize: 14,
    color: '#555',
  },
  bold: {
    fontWeight: '600',
  },
});

export default GameRow;
