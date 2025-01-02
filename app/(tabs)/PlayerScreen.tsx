import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { firestore } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

type StandingsStackParamList = {
  PlayerScreen: { playerID: string; teamID: string };
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
  shirtNumber?: number;
  position?: string;
  avgPTS?: number;
  avgREB?: number;
  avgAST?: number;
  avgSTL?: number;
  avgBLK?: number;
  avgSecs?: number;
  gamesPlayed?: number;
}

interface GameStats {
  gameID: string;
  opponentTeamName: string;
  isWin: boolean;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  minutes: string;
}

const PlayerScreen: React.FC = () => {
  const route = useRoute<PlayerScreenRouteProp>();
  const { playerID, teamID } = route.params;

  const [player, setPlayer] = useState<PlayerDoc | null>(null);
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);

        // Fetch player data
        const playerRef = doc(firestore, `teams/${teamID}/players`, playerID);
        const playerSnap = await getDoc(playerRef);
        if (playerSnap.exists()) {
          setPlayer(playerSnap.data() as PlayerDoc);
        }

        // Fetch game stats
        const gamesSnap = await getDocs(collection(firestore, 'games'));
        const stats: GameStats[] = [];
        for (const gDoc of gamesSnap.docs) {
          const gameData = gDoc.data();
          const boxScoresSnap = await getDocs(
            collection(firestore, `games/${gDoc.id}/BoxScoreHome`)
          );
          const playerStats = boxScoresSnap.docs
            .map((docSnap) => docSnap.data())
            .find(
              (data) =>
                data.name === `${playerSnap.data()?.firstName} ${playerSnap.data()?.lastName}`
            );

          if (playerStats) {
            const isWin =
              gameData.homeTeam === teamID
                ? gameData.finalPointsHome > gameData.finalPointsAway
                : gameData.finalPointsAway > gameData.finalPointsHome;

            stats.push({
              gameID: gDoc.id,
              opponentTeamName: gameData.awayTeam,
              isWin,
              points: playerStats.PTS || 0,
              rebounds: (playerStats.OFFREB || 0) + (playerStats.DEFFREB || 0),
              assists: playerStats.AST || 0,
              steals: playerStats.STL || 0,
              blocks: playerStats.BLK || 0,
              minutes: formatMinutes(playerStats.secs || 0),
            });
          }
        }
        setGameStats(stats);
      } catch (err) {
        console.error('Error fetching player data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerID, teamID]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text>Loading Player Data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!player) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text>No player data found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderGameRow = ({ item }: { item: GameStats }) => {
    const resultColor = item.isWin ? 'green' : 'red';
    const venuePrefix = item.isWin ? 'vs' : '@';

    return (
      <View style={styles.gameRow}>
        <Text style={styles.opponentLine}>
          <Text style={styles.bold}>{venuePrefix} {item.opponentTeamName}</Text>{' '}
          <Text style={[styles.bold, { color: resultColor }]}>
            {item.isWin ? 'W' : 'L'}
          </Text>
        </Text>
        <Text style={styles.statsLine}>
          PTS: {item.points}, REB: {item.rebounds}, AST: {item.assists},
          {'  '}STL: {item.steals}, BLK: {item.blocks}, MINS: {item.minutes}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.topSection}>
          {player.photoURL ? (
            <Image source={{ uri: player.photoURL }} style={styles.playerPhoto} />
          ) : (
            <View style={[styles.playerPhoto, { backgroundColor: '#ccc' }]} />
          )}
          <View style={styles.bioContainer}>
            <Text style={styles.playerName}>
              {player.firstName} {player.lastName}
            </Text>
            {player.dob && <Text>DOB: {player.dob}</Text>}
            {player.age && <Text>Age: {player.age}</Text>}
            {player.height && <Text>Height: {player.height} cm</Text>}
            {player.weight && <Text>Weight: {player.weight} kg</Text>}
          </View>
        </View>
        <View style={styles.overallStatsSection}>
          <Text style={styles.sectionTitle}>Overall Stats</Text>
          {player.gamesPlayed ? (
            <>
              <Text>Games Played: {player.gamesPlayed}</Text>
              <Text>Avg PTS: {player.avgPTS?.toFixed(1)}</Text>
              <Text>Avg REB: {player.avgREB?.toFixed(1)}</Text>
              <Text>Avg AST: {player.avgAST?.toFixed(1)}</Text>
              <Text>Avg STL: {player.avgSTL?.toFixed(1)}</Text>
              <Text>Avg BLK: {player.avgBLK?.toFixed(1)}</Text>
              <Text>Avg Mins: {formatMinutes(player.avgSecs || 0)}</Text>
            </>
          ) : (
            <Text>No stats available for this player.</Text>
          )}
        </View>
        <Text style={styles.sectionTitle}>Game by Game Stats</Text>
        <FlatList
          data={gameStats}
          keyExtractor={(item) => item.gameID}
          renderItem={renderGameRow}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PlayerScreen;

function formatMinutes(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
    marginLeft: 16,
  },
  gameRow: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  opponentLine: {
    marginBottom: 2,
    fontSize: 14,
  },
  bold: {
    fontWeight: '600',
  },
  statsLine: {
    fontSize: 14,
    color: '#555',
  },
});
