import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { firestore } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

type StandingsStackParamList = {
  PlayerScreen: { playerID: string };
};

type PlayerScreenRouteProp = RouteProp<StandingsStackParamList, 'PlayerScreen'>;

interface PlayerDoc {
  firstName?: string;
  lastName?: string;
  photoURL?: string;
}

const PlayerScreen: React.FC = () => {
  const route = useRoute<PlayerScreenRouteProp>();
  const { playerID } = route.params;

  const [player, setPlayer] = useState<PlayerDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true);
        const ref = doc(firestore, 'players', playerID);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setPlayer(snap.data() as PlayerDoc);
        } else {
          setPlayer({});
        }
      } catch (err) {
        console.error('Error fetching player:', err);
        setPlayer({});
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [playerID]);

  if (loading) {
    return <Text>Loading player...</Text>;
  }
  if (!player) {
    return <Text>No player found.</Text>;
  }

  return (
    <View style={styles.container}>
      {player.photoURL ? (
        <Image source={{ uri: player.photoURL }} style={styles.playerPhoto} />
      ) : (
        <View style={[styles.playerPhoto, { backgroundColor: '#ccc' }]} />
      )}
      <Text style={styles.playerName}>
        {player.firstName ?? 'Unknown'} {player.lastName ?? ''}
      </Text>
    </View>
  );
};

export default PlayerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  playerName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
