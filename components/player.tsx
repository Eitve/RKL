// Player.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

type PlayerProps = {
  picture: string;
  firstName: string;
  lastName: string;
  height: string;
  weight: string;
  number: number;
  team: string;
};

const Player: React.FC<PlayerProps> = ({ picture, firstName, lastName, height, weight, number, team }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: picture }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{firstName} {lastName}</Text>
        <Text style={styles.detail}>Team: {team}</Text>
        <Text style={styles.detail}>Number: #{number}</Text>
        <Text style={styles.detail}>Height: {height}</Text>
        <Text style={styles.detail}>Weight: {weight}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
    marginVertical: 5,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
});

export default Player;
