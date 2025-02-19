import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';

interface PlayerData {
  id: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
}

interface PlayerProps {
  player: PlayerData;
  onPress: (playerId: string) => void;
}

const Player: React.FC<PlayerProps> = ({ player, onPress }) => {
  return (
    <Pressable style={styles.playerRow} onPress={() => onPress(player.id)}>
      {player.photoURL ? (
        <Image source={{ uri: player.photoURL }} style={styles.playerImage} />
      ) : (
        <View style={[styles.playerImage, { backgroundColor: '#ccc' }]} />
      )}
      <Text style={styles.playerName}>
        {player.firstName ?? 'Unknown'} {player.lastName ?? ''}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  playerName: {
    fontSize: 16,
  },
});

export default Player;
