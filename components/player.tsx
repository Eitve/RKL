import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface PlayerData {
  firstName: string;
  lastName: string;
  photoURL: string;
  age: number;
  dob: string;
  position: string;
  s2PAPG: number;
  s2PMPG: number;
  s2pPercent: number;
  s3PAPG: number;
  s3PMPG: number;
  s3pPercent: number;
  sAPG: number;
  sBLKPG: number;
  sEFF: number;
  sFOPG: number;
  sFTPercent: number;
  sFTAPG: number;
  sFTMPG: number;
  sGP: number;
  sMPG: number;
  sPFPG: number;
  sPPG: number;
  sRPG: number;
  sSTPG: number;
  sTOPG: number;
  shirtNumber: number;
  weight: number;
}

interface PlayerProps {
  playerData: PlayerData;
}

const Player: React.FC<PlayerProps> = ({ playerData }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: playerData.photoURL }} style={styles.photo} />
      <Text style={styles.name}>{playerData.firstName} {playerData.lastName}</Text>
      <Text>Position: {playerData.position}</Text>
      <Text>Age: {playerData.age}</Text>
      <Text>Shirt Number: {playerData.shirtNumber}</Text>
      <Text>PPG: {playerData.sPPG}</Text>
      <Text>RPG: {playerData.sRPG}</Text>
      <Text>APG: {playerData.sAPG}</Text>
      <Text>EFF: {playerData.sEFF}</Text>
      <Text>Weight: {playerData.weight} kg</Text>
      {}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default Player;
