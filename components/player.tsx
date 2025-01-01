import React from 'react';
import { View, Text, Pressable, Image, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface PlayerProps {
  teamID: string;
  players: {
    id: string;
    firstName: string;
    lastName: string;
    photoURL?: string;
    shirtNumber?: number;
    position?: string;
  }[];
}

const Player: React.FC<PlayerProps> = ({ teamID, players }) => {
  const navigation = useNavigation();

  const navigateToPlayerScreen = (playerID: string) => {
    navigation.navigate('PlayerScreen', {
      teamID,
      playerID, // Pass both `teamID` and `playerID`
    });
  };

  const renderPlayer = ({ item }: { item: typeof players[0] }) => (
    <Pressable
      style={styles.playerRow}
      onPress={() => navigateToPlayerScreen(item.id)}
    >
      {item.photoURL ? (
        <Image source={{ uri: item.photoURL }} style={styles.playerImage} />
      ) : (
        <View style={[styles.playerImage, { backgroundColor: '#ccc' }]} />
      )}
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>
          {item.firstName} {item.lastName}
        </Text>
        {item.position && <Text style={styles.playerPosition}>Position: {item.position}</Text>}
        {item.shirtNumber && <Text>Shirt #: {item.shirtNumber}</Text>}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={renderPlayer}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default Player;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  playerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerPosition: {
    color: '#555',
  },
});
