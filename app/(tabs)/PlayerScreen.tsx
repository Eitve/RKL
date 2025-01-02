import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator,} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { firestore } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs, query, where,} from 'firebase/firestore';

import { StatisticsStackParamList } from './_layout';

type PlayerScreenRouteProp = RouteProp<StatisticsStackParamList, 'PlayerScreen'>;
type PlayerScreenNavProp = NativeStackNavigationProp<
  StatisticsStackParamList,
  'PlayerScreen'
>;

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
  finalScore: string;
  opponentTeamName: string; 
  isWin: boolean;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  minutes: string;
}

function formatMinutes(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const PlayerScreen: React.FC = () => {
  const route = useRoute<PlayerScreenRouteProp>();
  const navigation = useNavigation<PlayerScreenNavProp>();

  const { playerID, teamID } = route.params;

  const [player, setPlayer] = useState<PlayerDoc | null>(null);
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);

        const playerRef = doc(firestore, `teams/${teamID}/players`, playerID);
        const playerSnap = await getDoc(playerRef);
        if (playerSnap.exists()) {
          setPlayer(playerSnap.data() as PlayerDoc);
        }

        const gamesSnap = await getDocs(collection(firestore, 'games'));
        const statsArray: GameStats[] = [];

        for (const gDoc of gamesSnap.docs) {
          const gameData: any = gDoc.data();
          const homeTeamID = gameData.homeTeam;
          const awayTeamID = gameData.awayTeam;
          const homeScore = gameData.finalPointsHome;
          const awayScore = gameData.finalPointsAway;

          const isHome = homeTeamID === teamID;
          const isAway = awayTeamID === teamID;
          if (!isHome && !isAway) continue;

          const finalScore = `${homeScore}-${awayScore}`;

          const isWin = (isHome && homeScore > awayScore) || (isAway && awayScore > homeScore);

          const opponentID = isHome ? awayTeamID : homeTeamID;

          let opponentTeamName = opponentID;
          const teamsRef = collection(firestore, 'teams');
          const oppQ = query(teamsRef, where('teamID', '==', opponentID));
          const oppSnap = await getDocs(oppQ);
          if (!oppSnap.empty) {
            const oppDocData: any = oppSnap.docs[0].data();
            opponentTeamName = oppDocData.teamName || opponentID;
          }

          const boxCollName = isHome ? 'BoxScoreHome' : 'BoxScoreAway';
          const boxSnap = await getDocs(collection(firestore, `games/${gDoc.id}/${boxCollName}`));

          let foundBox: any = null;
          if (playerSnap.exists()) {
            const fullName = `${playerSnap.data()?.firstName} ${playerSnap.data()?.lastName}`.trim();
            boxSnap.forEach((doc) => {
              const d = doc.data();
              if (d.name && d.name.trim() === fullName) {
                foundBox = d;
              }
            });
          }

          if (foundBox) {
            const points = foundBox.PTS || 0;
            const rebounds = (foundBox.OFFREB || 0) + (foundBox.DEFFREB || 0);
            const assists = foundBox.AST || 0;
            const steals = foundBox.STL || 0;
            const blocks = foundBox.BLK || 0;
            const minutes = formatMinutes(foundBox.secs || 0);

            statsArray.push({
              gameID: gDoc.id,
              finalScore,
              opponentTeamName,
              isWin,
              points,
              rebounds,
              assists,
              steals,
              blocks,
              minutes,
            });
          }
        }

        setGameStats(statsArray);
      } catch (err) {
        console.error('Error fetching player data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerID, teamID]);

  const handleGamePress = useCallback(
    (gameID: string) => {
      const gameIDNum = parseInt(gameID, 10) || 0;
      navigation.navigate('GameDetails', { gameID: gameIDNum });
    },
    [navigation]
  );


  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
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
    const resultLabel = item.isWin ? 'W' : 'L';

    return (
      <TouchableOpacity onPress={() => handleGamePress(item.gameID)} style={styles.gameRow}>
        <Text style={styles.opponentLine}>
          <Text style={styles.bold}>{item.opponentTeamName}</Text>{' '}
          <Text>{item.finalScore}</Text>{'  '}
          <Text style={[styles.bold, { color: resultColor }]}>{resultLabel}</Text>
        </Text>
        <Text style={styles.statsLine}>
          PTS: {item.points}, REB: {item.rebounds}, AST: {item.assists},
          {'  '}STL: {item.steals}, BLK: {item.blocks}, MINS: {item.minutes}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderListHeader = () => {
    return (
      <View>
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
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={gameStats}
        keyExtractor={(item) => item.gameID}
        renderItem={renderGameRow}
        ListHeaderComponent={renderListHeader}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

export default PlayerScreen;

const styles = StyleSheet.create({
  safeArea: {
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
    paddingBottom: 10,
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
  statsLine: {
    fontSize: 14,
    color: '#555',
  },
  bold: {
    fontWeight: '600',
  },
});
