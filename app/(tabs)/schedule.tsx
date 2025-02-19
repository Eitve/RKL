import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, FlatList, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { ScheduleStackParamList } from './_layout';
import CompletedGameItem from '../../components/CompletedGameItem';
import ScheduledGameItem from '../../components/ScheduledGameItem';
import { GameProps, ScheduledGameProps, TeamProps } from '../../types';
import { formatGameDate, isDivisionMatch } from '../../components/gameUtils';
import styles from '../Styles/ScheduleStyles';

type ScheduleScreenNavigationProp = NativeStackNavigationProp<
  ScheduleStackParamList,
  'ScheduleMain'
>;

const ScheduleScreen = () => {
  const navigation = useNavigation<ScheduleScreenNavigationProp>();
  const [games, setGames] = useState<GameProps[]>([]);
  const [scheduledGames, setScheduledGames] = useState<ScheduledGameProps[]>([]);
  const [teams, setTeams] = useState<Map<string, TeamProps>>(new Map());
  const [isResultsView, setIsResultsView] = useState(false);
  const [isDivisionB, setIsDivisionB] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch teams
        const teamsSnap = await getDocs(collection(firestore, 'teams'));
        const teamMap = new Map<string, TeamProps>();
        teamsSnap.docs.forEach((doc) => {
          const data = doc.data() as any;
          teamMap.set(data.teamID, {
            id: data.teamID,
            teamName: data.teamName || doc.id,
            icon: data.icon || '',
          });
        });
        setTeams(teamMap);

        // Fetch completed games
        const gamesSnap = await getDocs(collection(firestore, 'games'));
        const completedGames: GameProps[] = gamesSnap.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            gameID: data.gameID || 0,
            homeTeam: data.homeTeam || '',
            awayTeam: data.awayTeam || '',
            finalPointsHome: data.finalPointsHome ?? null,
            finalPointsAway: data.finalPointsAway ?? null,
            division: data.division || 'A',
          };
        });
        setGames(completedGames);

        // Fetch scheduled games
        const scheduledSnap = await getDocs(collection(firestore, 'scheduledGames'));
        const upcoming: ScheduledGameProps[] = [];
        scheduledSnap.docs.forEach((doc) => {
          const data = doc.data() as any;
          const { dateObj, dateStr } = formatGameDate(data.gameDate);
          upcoming.push({
            homeTeam: data.homeTeam || '',
            awayTeam: data.awayTeam || '',
            division: data.division || 'A',
            arena: data.arena || '',
            dateObj,
            dateStr,
          });
        });
        upcoming.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
        setScheduledGames(upcoming);
      } catch (error) {
        console.error('Error fetching schedule data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter completed games and scheduled games based on division
  const filteredResults = games.filter(
    (g) =>
      isDivisionMatch(g.division, isDivisionB) &&
      g.finalPointsHome !== null &&
      g.finalPointsAway !== null
  );

  const filteredSchedule = scheduledGames.filter((sg) =>
    isDivisionMatch(sg.division, isDivisionB)
  );

  const handleGamePress = (game: GameProps) => {
    navigation.navigate('GameDetails', { gameID: game.gameID });
  };

  const renderCompletedGame = ({ item }: { item: GameProps }) => {
    const homeTeam = teams.get(item.homeTeam);
    const awayTeam = teams.get(item.awayTeam);

    if (!homeTeam || !awayTeam) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Missing team data for GameID: {item.gameID}
          </Text>
        </View>
      );
    }

    return (
      <CompletedGameItem
        game={item}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        onPress={handleGamePress}
      />
    );
  };

  const renderScheduledGame = ({ item }: { item: ScheduledGameProps }) => {
    const homeTeam = teams.get(item.homeTeam);
    const awayTeam = teams.get(item.awayTeam);
    return (
      <ScheduledGameItem
        scheduledGame={item}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Schedule</Text>
        <Switch
          value={isResultsView}
          onValueChange={(val) => setIsResultsView(val)}
          style={styles.switch}
        />
        <Text style={styles.switchLabel}>Results</Text>
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Division A</Text>
        <Switch
          value={isDivisionB}
          onValueChange={(val) => setIsDivisionB(val)}
          style={styles.switch}
        />
        <Text style={styles.switchLabel}>Division B</Text>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : isResultsView ? (
        <FlatList
          data={filteredResults}
          keyExtractor={(item) => item.gameID.toString()}
          renderItem={renderCompletedGame}
        />
      ) : (
        <FlatList
          data={filteredSchedule}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderScheduledGame}
        />
      )}
    </SafeAreaView>
  );
};

export default ScheduleScreen;
