import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Image, FlatList, StyleSheet, Switch } from 'react-native';
import { firestore } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

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

const ScheduleScreen = () => {
  const [games, setGames] = useState<GameProps[]>([]);
  const [teams, setTeams] = useState<Map<string, TeamProps>>(new Map());
  const [isResultsView, setIsResultsView] = useState(false); // Switch for Schedule/Results
  const [isDivisionB, setIsDivisionB] = useState(false); // Switch for Division A/B
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGamesAndTeams = async () => {
      try {
        setLoading(true);

        // Fetch teams
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

        console.log('Loaded Teams:', Array.from(teamMap.keys())); // Debugging
        setTeams(teamMap);

        // Fetch games
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

        console.log('Loaded Games:', gamesList); // Debugging
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

    const isResultsViewMatch =
      isResultsView
        ? game.finalPointsHome !== null && game.finalPointsAway !== null
        : game.finalPointsHome === null && game.finalPointsAway === null;

    return isDivisionMatch && isResultsViewMatch;
  });

  const renderGame = ({ item }: { item: GameProps }) => {
    const homeTeam = teams.get(item.homeTeam); // Match homeTeam with teamID
    const awayTeam = teams.get(item.awayTeam); // Match awayTeam with teamID

    console.log(`Game ID: ${item.gameID}`);
    console.log(`HomeTeam: ${item.homeTeam}, Match:`, homeTeam ? homeTeam.name : 'Not Found');
    console.log(`AwayTeam: ${item.awayTeam}, Match:`, awayTeam ? awayTeam.name : 'Not Found');

    if (!homeTeam || !awayTeam) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Missing data for teams in GameID: {item.gameID}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.gameContainer}>
        {/* Home Team */}
        <View style={styles.teamRow}>
          <View style={styles.teamInfo}>
            <Image source={{ uri: homeTeam.icon }} style={styles.teamIcon} />
            <Text style={styles.teamName}>{homeTeam.name}</Text>
          </View>
          <Text style={styles.teamPoints}>{item.finalPointsHome ?? '-'}</Text>
        </View>

        {/* Away Team */}
        <View style={styles.teamRow}>
          <View style={styles.teamInfo}>
            <Image source={{ uri: awayTeam.icon }} style={styles.teamIcon} />
            <Text style={styles.teamName}>{awayTeam.name}</Text>
          </View>
          <Text style={styles.teamPoints}>{item.finalPointsAway ?? '-'}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Schedule/Results Switch */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Schedule</Text>
        <Switch
          value={isResultsView}
          onValueChange={(value) => setIsResultsView(value)}
          style={styles.switch}
        />
        <Text style={styles.switchLabel}>Results</Text>
      </View>

      {/* Division A/B Switch */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Division A</Text>
        <Switch
          value={isDivisionB}
          onValueChange={(value) => setIsDivisionB(value)}
          style={styles.switch}
        />
        <Text style={styles.switchLabel}>Division B</Text>
      </View>

      {/* Game List */}
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
    justifyContent: 'space-between', // Align items to the sides
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
