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
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

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
  // Some leagues store cumulative averages at the player level,
  // but here we calculate them ourselves.
}

interface GameDoc {
  homeTeam: string;
  awayTeam: string;
  finalPointsHome: number;
  finalPointsAway: number;
  winner?: string;
  // If you have a "winner" field, you can use that instead of finalPointsHome/finalPointsAway to see who won.
}

interface TeamDoc {
  teamID: string;
  teamName?: string;
  icon?: string;
}

interface GameStats {
  gameID: string;
  points: number;
  rebounds: number;
  assists: number;
  blocks: number;
  steals: number;
  minutes: string;

  // Additional fields for the new single-line display:
  finalPointsHome: number;
  finalPointsAway: number;
  homeTeam: string;
  awayTeam: string;
  opponentTeamID: string;    // The ID of the other team
  opponentTeamName: string; // The name of the other team
  isWin: boolean;           // Did this player's team win?
}

interface OverallStats {
  gamesPlayed: number;
  avgPTS: number;
  avgREB: number;
  avgAST: number;
  avgSTL: number;
  avgBLK: number;
  avgMins: string;
}

const PlayerScreen: React.FC = () => {
  const route = useRoute<PlayerScreenRouteProp>();
  const { playerID, teamID } = route.params;

  const [player, setPlayer] = useState<PlayerDoc | null>(null);
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);

        // 1. Fetch the basic player doc
        const playerRef = doc(firestore, `teams/${teamID}/players`, playerID);
        const playerSnap = await getDoc(playerRef);
        if (playerSnap.exists()) {
          setPlayer(playerSnap.data() as PlayerDoc);
        }

        // 2. Fetch all games (both home and away) for the player's team
        const homeGamesQuery = query(
          collection(firestore, 'games'),
          where('homeTeam', '==', teamID)
        );
        const awayGamesQuery = query(
          collection(firestore, 'games'),
          where('awayTeam', '==', teamID)
        );

        const [homeGamesSnap, awayGamesSnap] = await Promise.all([
          getDocs(homeGamesQuery),
          getDocs(awayGamesQuery),
        ]);

        const allGameDocs = [...homeGamesSnap.docs, ...awayGamesSnap.docs];

        let stats: GameStats[] = [];

        // We'll accumulate totals to compute overall averages
        let totalStats = {
          gamesPlayed: 0,
          points: 0,
          rebounds: 0,
          assists: 0,
          steals: 0,
          blocks: 0,
          minutes: 0, // store total minutes as a float
        };

        // 3. For each game, get the box scores and see if this player participated
        for (const gdoc of allGameDocs) {
          const gameID = gdoc.id;
          const gameData = gdoc.data() as GameDoc;

          // Sub-collections
          const boxScoreHomeSnap = await getDocs(
            collection(firestore, `games/${gameID}/BoxScoreHome`)
          );
          const boxScoreAwaySnap = await getDocs(
            collection(firestore, `games/${gameID}/BoxScoreAway`)
          );
          const boxScores = [
            ...boxScoreHomeSnap.docs,
            ...boxScoreAwaySnap.docs,
          ];

          // Find stats for this player
          const playerBoxScores = boxScores
            .map((docSnap) => {
              const data = docSnap.data();
              if (
                data.name ===
                `${playerSnap.data()?.firstName} ${playerSnap.data()?.lastName}`
              ) {
                return {
                  points: data.PTS || 0,
                  rebounds: (data.OFFREB || 0) + (data.DEFFREB || 0),
                  assists: data.AST || 0,
                  steals: data.STL || 0,
                  blocks: data.BLK || 0,
                  minutes: data.MINS || '00:00',
                };
              }
              return null;
            })
            .filter(Boolean);

          if (playerBoxScores.length > 0) {
            // Usually there's only 1 match, but just in case
            for (const pbs of playerBoxScores) {
              // Decide if the player's team is home or away
              const isHome = gameData.homeTeam === teamID;
              const isWin = isHome
                ? gameData.finalPointsHome > gameData.finalPointsAway
                : gameData.finalPointsAway > gameData.finalPointsHome;

              // Figure out the opponent team
              const opponentTeamID = isHome
                ? gameData.awayTeam
                : gameData.homeTeam;

              // Fetch the opponent team's doc to get the name
              // (If you have many games, you might want to cache these calls.)
              let opponentTeamName = opponentTeamID;
              const teamsColl = collection(firestore, 'teams');
              const teamQuery = query(
                teamsColl,
                where('teamID', '==', opponentTeamID)
              );
              const qSnap = await getDocs(teamQuery);
              if (!qSnap.empty) {
                const tDoc = qSnap.docs[0].data() as TeamDoc;
                opponentTeamName = tDoc.teamName || opponentTeamID;
              }

              const convertedMinutes = convertMinsToFloat(pbs.minutes);
              totalStats.gamesPlayed += 1;
              totalStats.points += pbs.points;
              totalStats.rebounds += pbs.rebounds;
              totalStats.assists += pbs.assists;
              totalStats.steals += pbs.steals;
              totalStats.blocks += pbs.blocks;
              totalStats.minutes += convertedMinutes;

              const row: GameStats = {
                gameID,
                points: pbs.points,
                rebounds: pbs.rebounds,
                assists: pbs.assists,
                blocks: pbs.blocks,
                steals: pbs.steals,
                minutes: pbs.minutes,

                finalPointsHome: gameData.finalPointsHome,
                finalPointsAway: gameData.finalPointsAway,
                homeTeam: gameData.homeTeam,
                awayTeam: gameData.awayTeam,
                opponentTeamID,
                opponentTeamName,
                isWin,
              };

              stats.push(row);
            }
          }
        }

        // 4. Compute overall stats
        if (totalStats.gamesPlayed > 0) {
          const {
            gamesPlayed,
            points,
            rebounds,
            assists,
            steals,
            blocks,
            minutes,
          } = totalStats;
          const avgMinsFloat = minutes / gamesPlayed;
          const avgMinsWhole = Math.floor(avgMinsFloat);
          const avgMinsSecs = Math.round((avgMinsFloat - avgMinsWhole) * 60);

          const overall: OverallStats = {
            gamesPlayed,
            avgPTS: points / gamesPlayed,
            avgREB: rebounds / gamesPlayed,
            avgAST: assists / gamesPlayed,
            avgSTL: steals / gamesPlayed,
            avgBLK: blocks / gamesPlayed,
            avgMins: `${avgMinsWhole}:${String(avgMinsSecs).padStart(2, '0')}`,
          };
          setOverallStats(overall);
        } else {
          setOverallStats(null);
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
    // Decide color for text: green if isWin = true, red if false
    const resultColor = item.isWin ? 'green' : 'red';

    // Build the final score string
    const scoreStr = `${item.finalPointsHome} - ${item.finalPointsAway}`;
    // We'll also see if the player's team was home or away
    // If the player's team is homeTeam, label "vs item.opponentTeamName" or "@ item.opponentTeamName" as you like
    const isHome = item.homeTeam === teamID;
    const venuePrefix = isHome ? 'vs' : '@';

    return (
      <View style={styles.gameRow}>
        <Text style={styles.opponentLine}>
          {/* Opponent + Score, color-coded */}
          <Text style={styles.bold}>{venuePrefix} {item.opponentTeamName}</Text>{'  '}
          <Text style={[styles.bold, { color: resultColor }]}>{scoreStr}</Text>
        </Text>

        {/* Next, show the stats in one line: PTS, REB, AST, STL, BLK, MINS */}
        <Text style={styles.statsLine}>
          PTS: {item.points}, REB: {item.rebounds}, AST: {item.assists},
          {'  '}STL: {item.steals}, BLK: {item.blocks},
          {'  '}MINS: {item.minutes}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Top Section with photo and bio */}
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

        {/* Overall Stats */}
        {overallStats ? (
          <View style={styles.overallStatsSection}>
            <Text style={styles.sectionTitle}>Overall Stats</Text>
            <Text>Games Played: {overallStats.gamesPlayed}</Text>
            <Text>Avg PTS: {overallStats.avgPTS.toFixed(1)}</Text>
            <Text>Avg REB: {overallStats.avgREB.toFixed(1)}</Text>
            <Text>Avg AST: {overallStats.avgAST.toFixed(1)}</Text>
            <Text>Avg STL: {overallStats.avgSTL.toFixed(1)}</Text>
            <Text>Avg BLK: {overallStats.avgBLK.toFixed(1)}</Text>
            <Text>Avg Mins: {overallStats.avgMins}</Text>
          </View>
        ) : (
          <View style={styles.overallStatsSection}>
            <Text style={styles.sectionTitle}>Overall Stats</Text>
            <Text>No stats found for this player.</Text>
          </View>
        )}

        {/* Game-by-game stats */}
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

/** Convert MINS "MM:SS" to a float (e.g. 10:30 => 10.5) */
function convertMinsToFloat(minsStr: string): number {
  const [mins, secs] = minsStr.split(':').map(Number);
  return (mins || 0) + ((secs || 0) / 60);
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
