import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NoDetailsFoundProps {
  gameID: number;
}

const NoDetailsFound: React.FC<NoDetailsFoundProps> = ({ gameID }) => (
  <View style={styles.centered}>
    <Text>No details found for Game ID: {gameID}</Text>
  </View>
);

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NoDetailsFound;