import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { PlayerAggregatedStats } from '../types';
import { formatMinutes } from './gameUtils';

type PlayerRowProps = {
  player: PlayerAggregatedStats;
  statFilter: string;
  onPress: () => void;
};

const PlayerRow: React.FC<PlayerRowProps> = ({ player, statFilter, onPress }) => {
  const gp = player.gamesPlayed || 1;
  const mmss = formatMinutes(Math.round(player.secs / gp));

  const getStatValue = () => {
    switch (statFilter) {
      case 'PTS':
        return player.pts / gp;
      case 'REB':
        return (player.offReb + player.defReb) / gp;
      case 'AST':
        return player.ast / gp;
      case 'STL':
        return player.stl / gp;
      case 'BLK':
        return player.blk / gp;
      case 'FG%': {
        const made = player.twoPM + player.threePM;
        const att = player.twoPA + player.threePA;
        return att ? (made / att) * 100 : 0;
      }
      case '2PT%':
        return player.twoPA ? (player.twoPM / player.twoPA) * 100 : 0;
      case '3PT%':
        return player.threePA ? (player.threePM / player.threePA) * 100 : 0;
      case 'FT%':
        return player.FTA ? (player.FTM / player.FTA) * 100 : 0;
      case 'EFF':
        return player.eff / gp;
      default:
        return 0;
    }
  };

  const value = getStatValue();
  const statDisplay = statFilter.includes('%')
    ? `${value.toFixed(1)}%`
    : value.toFixed(1);

  return (
    <TouchableOpacity style={styles.playerRow} onPress={onPress}>
      {player.photoURL ? (
        <Image source={{ uri: player.photoURL }} style={styles.playerImage} />
      ) : (
        <View style={[styles.playerImage, { backgroundColor: '#ccc' }]} />
      )}
      <View style={{ marginLeft: 10, flex: 1 }}>
        <Text style={styles.playerName}>
          {player.firstName} {player.lastName} (GP: {gp}, Mins/G: {mmss})
        </Text>
        <Text style={styles.teamName}>{player.teamName}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.statValue}>
          {statFilter}: {statDisplay}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    marginVertical: 6,
    padding: 10,
    borderRadius: 6,
  },
  playerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  playerName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  teamName: {
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default PlayerRow;