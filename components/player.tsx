import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { firestore } from '../app/firebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

type StandingsStackParamList = {
  PlayerScreen: { playerID: string };
  // ...
};
type PlayerScreenRouteProp = RouteProp<StandingsStackParamList, 'PlayerScreen'>;

interface PlayerDoc {
  firstName?: string;
  lastName?: string;
  dob?: string;
  age?: number;
  nationality?: string;
  height?: number;
  weight?: number;
  photoURL?: string;
}

interface GameStats {
  gameID?: string;
  points?: number;
  rebounds?: number;
  assists?: number;
  blocks?: number;
  steals?: number;
  minutes?: string;
  [key: string]: any;
}

const PlayerScreen: React.FC = () => {
  const route = useRoute<PlayerScreenRouteProp>();
  const { playerID } = route.params;

  const [player, setPlayer] = useState<PlayerDoc | null>(null);
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        const playerRef = doc(firestore, 'players', playerID);
        const snap = await getDoc(playerRef);
        if (snap.exists()) {
          setPlayer(snap.data() as PlayerDoc);
        } else {
          setPlayer({});
        }

        const subSnap = await getDocs(collection(playerRef, 'games'));
        const lines: GameStats[] = subSnap.docs.map((d) => {
          const data = d.data() || {};
          return {
            gameID: d.id,
            points: data.points,
            rebounds: data.rebounds,
            assists: data.assists,
            blocks: data.blocks,
            steals: data.steals,
            minutes: data.minutes,
          };
        });
        setGameStats(lines);
      } catch (err) {
        console.error('Error fetching player data:', err);
        setPlayer({});
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerID]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading Player Data...</Text>
      </View>
    );
  }

  if (!player) {
    return (
      <View style={styles.centered}>
        <Text>No player data found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topSection}>
        {player.photoURL ? (
          <Image
            source={{ uri: player.photoURL }}
            style={styles.playerPhoto}
          />
        ) : (
          <View style={[styles.playerPhoto, { backgroundColor: '#ccc' }]} />
        )}

        <View style={styles.bioContainer}>
          <Text style={styles.playerName}>
            {player.firstName} {player.lastName}
          </Text>
          {player.dob && <Text>DOB: {player.dob}</Text>}
          {player.age !== undefined && <Text>Age: {player.age}</Text>}
          {player.nationality && <Text>Nationality: {player.nationality}</Text>}
          {player.height !== undefined && <Text>Height: {player.height} cm</Text>}
          {player.weight !== undefined && <Text>Weight: {player.weight} kg</Text>}
        </View>
      </View>

      <View style={styles.overallStatsSection}>
        <Text style={styles.sectionTitle}>Overall Stats</Text>
        <View style={styles.statsRow}>
          <Text>Total Games: {gameStats.length}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Game by Game Stats</Text>
      <FlatList
        data={gameStats}
        keyExtractor={(item) => item.gameID || Math.random().toString()}
        style={{ marginTop: 8 }}
        renderItem={({ item }) => (
          <View style={styles.gameRow}>
            <Text style={[styles.gameCell, { flex: 1 }]}>GameID: {item.gameID}</Text>
            <Text style={[styles.gameCell, { flex: 0.6 }]}>Pts: {item.points ?? 0}</Text>
            <Text style={[styles.gameCell, { flex: 0.6 }]}>Reb: {item.rebounds ?? 0}</Text>
            <Text style={[styles.gameCell, { flex: 0.6 }]}>Ast: {item.assists ?? 0}</Text>
            <Text style={[styles.gameCell, { flex: 0.6 }]}>Stl: {item.steals ?? 0}</Text>
            <Text style={[styles.gameCell, { flex: 0.6 }]}>Blk: {item.blocks ?? 0}</Text>
            <Text style={[styles.gameCell, { flex: 0.8 }]}>Min: {item.minutes ?? '00:00'}</Text>
          </View>
        )}
      />
    </ScrollView>
  );
};

export default PlayerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    marginTop: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  gameRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  gameCell: {
    textAlign: 'center',
  },
});
