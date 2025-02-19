import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { ScheduledGameProps, TeamProps } from '../types';

type ScheduledGameItemProps = {
  scheduledGame: ScheduledGameProps;
  homeTeam?: TeamProps;
  awayTeam?: TeamProps;
};

const ScheduledGameItem: React.FC<ScheduledGameItemProps> = ({
  scheduledGame,
  homeTeam,
  awayTeam,
}) => {
  return (
    <View style={styles.gameContainer}>
      <View style={styles.teamRow}>
        <Image source={{ uri: homeTeam?.icon || '' }} style={styles.teamIcon} />
        <Text style={styles.teamName}>{homeTeam?.teamName || scheduledGame.homeTeam}</Text>
      </View>

      <View style={styles.vsContainer}>
        <Text style={styles.vsText}>vs</Text>
      </View>

      <View style={styles.teamRow}>
        <Image source={{ uri: awayTeam?.icon || '' }} style={styles.teamIcon} />
        <Text style={styles.teamName}>{awayTeam?.teamName || scheduledGame.awayTeam}</Text>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.arenaText}>
          {scheduledGame.arena ? `Arena: ${scheduledGame.arena}` : ''}
        </Text>
        <Text style={styles.gameDateText}>{scheduledGame.dateStr}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gameContainer: {
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  teamIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  vsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  arenaText: {
    fontSize: 14,
    color: '#555',
    maxWidth: '65%',
  },
  gameDateText: {
    fontSize: 14,
    color: '#555',
  },
});

export default ScheduledGameItem;
