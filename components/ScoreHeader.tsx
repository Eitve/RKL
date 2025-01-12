import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface TeamInfo {
  teamName: string;
  teamIcon?: string;
}

interface ScoreHeaderProps {
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  finalPointsHome: number;
  finalPointsAway: number;
}

const ScoreHeader: React.FC<ScoreHeaderProps> = ({
  homeTeam,
  awayTeam,
  finalPointsHome,
  finalPointsAway,
}) => (
  <View style={styles.scoreHeader}>
    {/* Home Team */}
    <View style={styles.teamInfo}>
      {homeTeam.teamIcon ? (
        <Image source={{ uri: homeTeam.teamIcon }} style={styles.teamIcon} />
      ) : (
        <View style={[styles.teamIcon, { backgroundColor: '#ccc' }]} />
      )}
      <Text style={styles.teamName}>{homeTeam.teamName}</Text>
    </View>

    {/* Scores */}
    <View style={styles.scoreContainer}>
      <Text style={styles.scoreText}>{finalPointsHome}</Text>
      <Text style={styles.scoreDivider}> - </Text>
      <Text style={styles.scoreText}>{finalPointsAway}</Text>
    </View>

    {/* Away Team */}
    <View style={styles.teamInfo}>
      {awayTeam.teamIcon ? (
        <Image source={{ uri: awayTeam.teamIcon }} style={styles.teamIcon} />
      ) : (
        <View style={[styles.teamIcon, { backgroundColor: '#ccc' }]} />
      )}
      <Text style={styles.teamName}>{awayTeam.teamName}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 10,
    flexWrap: 'wrap',
  },
  teamInfo: {
    alignItems: 'center',
    maxWidth: 100,
  },
  teamIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 4,
  },
  teamName: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreDivider: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
});

export default ScoreHeader;