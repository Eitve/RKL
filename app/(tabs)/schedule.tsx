import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { firestore } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

import { ScheduleStackParamList } from './ScheduleStack';

type GameProps = {
  gameID: number;
  homeTeam: string;
  awayTeam: string;
  finalPointsHome: number | null;
  finalPointsAway: number | null;
  division: 'A' | 'B';
};

type TeamProps = {
  id: string;
  name: string;
  icon: string;
};

type ScheduleScreenNavigationProp = NativeStackNavigationProp<
  ScheduleStackParamList,
  'ScheduleMain'
>;

const ScheduleScreen = () => {
  const navigation = useNavigation<ScheduleScreenNavigationProp>();

  const [games, setGames] = useState<GameProps[]>([]);
  const [teams, setTeams] = useState<Map<string, TeamProps>>(new Map());
  const [isResultsView, setIsResultsView] = useState(false);
  const [isDivisionB, setIsDivisionB] = useState(false); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGamesAndTeams = async () => {
      try {
        setLoading(true);

        const teamsCollection = collection(firestore, 'teams');
        const teamSnapshot = await getDocs(teamsCollection);
        const teamMap = new Map<string, TeamProps>();
        teamSnapshot.docs.forEach((doc) => {
          const data = doc.data() as any;
          teamMap.set(data.teamID, {
            id: data.teamID,
            name: data.teamName || doc.id,
            icon: data.icon || '',
          });
        });
        setTeams(teamMap);

        const gamesCollection = collection(firestore, 'games');
        const gameSnapshot = await getDocs(gamesCollection);
        const gamesList: GameProps[] = gameSnapshot.docs.map((doc) => {
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

        setGames(gamesList);
      } catch (error) {
        console.error('Error fetching games or teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGamesAndTeams();
  }, []);

  const filteredGames = games.filter((game) => {
    const isDivisionMatch = game.division === (isDivisionB ? 'B' : 'A');
    const isResultsViewMatch = isResultsView
      ? game.finalPointsHome !== null && game.finalPointsAway !== null
      : game.finalPointsHome === null && game.finalPointsAway === null;

    return isDivisionMatch && isResultsViewMatch;
  });

  const handleGamePress = (game: GameProps) => {
    navigation.navigate('GameDetails', { gameID: game.gameID });
  };

  const renderGame = ({ item }: { item: GameProps }) => {
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
      <TouchableOpacity
        style={styles.gameContainer}
        onPress={() => handleGamePress(item)}
      >
        <View style={styles.teamRow}>
          <View style={styles.teamInfo}>
            <Image source={{ uri: homeTeam.icon }} style={styles.teamIcon} />
            <Text style={styles.teamName}>{homeTeam.name}</Text>
          </View>
          <Text style={styles.teamPoints}>{item.finalPointsHome ?? '-'}</Text>
        </View>

        <View style={styles.teamRow}>
          <View style={styles.teamInfo}>
            <Image source={{ uri: awayTeam.icon }} style={styles.teamIcon} />
            <Text style={styles.teamName}>{awayTeam.name}</Text>
          </View>
          <Text style={styles.teamPoints}>{item.finalPointsAway ?? '-'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Schedule</Text>
        <Switch
          value={isResultsView}
          onValueChange={(value) => setIsResultsView(value)}
          style={styles.switch}
        />
        <Text style={styles.switchLabel}>Results</Text>
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Division A</Text>
        <Switch
          value={isDivisionB}
          onValueChange={(value) => setIsDivisionB(value)}
          style={styles.switch}
        />
        <Text style={styles.switchLabel}>Division B</Text>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <FlatList
          data={filteredGames}
          keyExtractor={(item) => item.gameID.toString()}
          renderItem={renderGame}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    marginHorizontal: 5,
  },
  switch: {
    marginHorizontal: 10,
  },
  gameContainer: {
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  teamPoints: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  errorContainer: {
    padding: 10,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
  },
});

export default ScheduleScreen;
