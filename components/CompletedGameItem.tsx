import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { GameProps, TeamProps } from '../types';

type CompletedGameItemProps = {
  game: GameProps;
  homeTeam: TeamProps;
  awayTeam: TeamProps;
  onPress: (game: GameProps) => void;
};

const CompletedGameItem: React.FC<CompletedGameItemProps> = ({
  game,
  homeTeam,
  awayTeam,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.gameContainer} onPress={() => onPress(game)}>
      <View style={styles.teamRow}>
        <View style={styles.teamInfo}>
          <Image source={{ uri: homeTeam.icon }} style={styles.teamIcon} />
          <Text style={styles.teamName}>{homeTeam.teamName}</Text>
        </View>
        <Text style={styles.teamPoints}>{game.finalPointsHome ?? '-'}</Text>
      </View>
      <View style={styles.teamRow}>
        <View style={styles.teamInfo}>
          <Image source={{ uri: awayTeam.icon }} style={styles.teamIcon} />
          <Text style={styles.teamName}>{awayTeam.teamName}</Text>
        </View>
        <Text style={styles.teamPoints}>{game.finalPointsAway ?? '-'}</Text>
      </View>
    </TouchableOpacity>
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
    justifyContent: 'space-between',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  teamPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
});

export default CompletedGameItem;
