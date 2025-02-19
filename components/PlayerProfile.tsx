import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { PlayerDoc } from '../types';
import { formatMinutes } from '../components/gameUtils';

interface PlayerProfileProps {
  player: PlayerDoc;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ player }) => {
  return (
    <View>
      <View style={styles.topSection}>
        {player.photoURL ? (
          <Image source={{ uri: player.photoURL }} style={styles.playerPhoto} />
        ) : (
          <View style={[styles.playerPhoto, { backgroundColor: '#ccc' }]} />
        )}
        <View style={styles.bioContainer}>
          <Text style={styles.playerName}>
            {player.firstName} {player.lastName}
          </Text>
          {player.dob && <Text>DOB: {player.dob}</Text>}
          {player.age && <Text>Age: {player.age}</Text>}
          {player.height && <Text>Height: {player.height} cm</Text>}
          {player.weight && <Text>Weight: {player.weight} kg</Text>}
        </View>
      </View>

      <View style={styles.overallStatsSection}>
        <Text style={styles.sectionTitle}>Overall Stats</Text>
        {player.gamesPlayed ? (
          <>
            <Text>Games Played: {player.gamesPlayed}</Text>
            <Text>Avg PTS: {player.avgPTS?.toFixed(1)}</Text>
            <Text>Avg REB: {player.avgREB?.toFixed(1)}</Text>
            <Text>Avg AST: {player.avgAST?.toFixed(1)}</Text>
            <Text>Avg STL: {player.avgSTL?.toFixed(1)}</Text>
            <Text>Avg BLK: {player.avgBLK?.toFixed(1)}</Text>
            <Text>Avg Mins: {formatMinutes(player.avgSecs || 0)}</Text>
          </>
        ) : (
          <Text>No stats available for this player.</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topSection: {
    flexDirection: 'row',
    padding: 16,
  },
  playerPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  bioContainer: {
    marginLeft: 16,
    flex: 1,
  },
  playerName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  overallStatsSection: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
    marginLeft: 16,
  },
});

export default PlayerProfile;
