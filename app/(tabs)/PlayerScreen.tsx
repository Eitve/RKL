import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, FlatList, ActivityIndicator, View, Text, StyleSheet, } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { firestore } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { formatMinutes } from '../../components/gameUtils';
import { StatisticsStackParamList } from './_layout';
import PlayerProfile from '../../components/PlayerProfile';
import GameRow from '../../components/GameRow';
import { PlayerDoc, GameStats } from '../../types';
import styles from '../Styles/PlayerScreenStyles'

type PlayerScreenRouteProp = RouteProp<StatisticsStackParamList, 'PlayerScreen'>;
type PlayerScreenNavProp = NativeStackNavigationProp<StatisticsStackParamList, 'PlayerScreen'>;

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

        // Fetch player data
        const playerRef = doc(firestore, `teams/${teamID}/players`, playerID);
        const playerSnap = await getDoc(playerRef);
        if (playerSnap.exists()) {
          setPlayer(playerSnap.data() as PlayerDoc);
        }

        // Fetch all games
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
          const isWin =
            (isHome && homeScore > awayScore) || (isAway && awayScore > homeScore);
          const opponentID = isHome ? awayTeamID : homeTeamID;

          // Get opponent team name
          let opponentTeamName = opponentID;
          const teamsRef = collection(firestore, 'teams');
          const oppQ = query(teamsRef, where('teamID', '==', opponentID));
          const oppSnap = await getDocs(oppQ);
          if (!oppSnap.empty) {
            const oppDocData: any = oppSnap.docs[0].data();
            opponentTeamName = oppDocData.teamName || opponentID;
          }

          // Fetch box score data
          const boxCollName = isHome ? 'BoxScoreHome' : 'BoxScoreAway';
          const boxSnap = await getDocs(
            collection(firestore, `games/${gDoc.id}/${boxCollName}`)
          );

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

  const renderGameRow = ({ item }: { item: GameStats }) => (
    <GameRow game={item} onPress={handleGamePress} />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={gameStats}
        keyExtractor={(item) => item.gameID}
        renderItem={renderGameRow}
        ListHeaderComponent={() => (
          <>
            <PlayerProfile player={player} />
            <Text style={styles.sectionTitle}>Game by Game Stats</Text>
          </>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

export default PlayerScreen;

