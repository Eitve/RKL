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
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { ScheduleStackParamList } from './_layout';

type GameProps = {
  gameID: number;
  homeTeam: string;
  awayTeam: string;
  finalPointsHome: number | null;
  finalPointsAway: number | null;
  division: 'A' | 'B';
};

type ScheduledGameProps = {
  homeTeam: string;
  awayTeam: string;
  division: 'A' | 'B';
  arena?: string;
  dateObj: Date;
  dateStr: string;
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
  const [scheduledGames, setScheduledGames] = useState<ScheduledGameProps[]>([]);
  const [teams, setTeams] = useState<Map<string, TeamProps>>(new Map());
  const [isResultsView, setIsResultsView] = useState(false);
  const [isDivisionB, setIsDivisionB] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const teamsSnap = await getDocs(collection(firestore, 'teams'));
        const teamMap = new Map<string, TeamProps>();
        teamsSnap.docs.forEach((doc) => {
          const data = doc.data() as any;
          teamMap.set(data.teamID, {
            id: data.teamID,
            name: data.teamName || doc.id,
            icon: data.icon || '',
          });
        });
        setTeams(teamMap);

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

        const scheduledSnap = await getDocs(collection(firestore, 'scheduledGames'));
        const upcoming: ScheduledGameProps[] = [];
        scheduledSnap.docs.forEach((doc) => {
          const data = doc.data() as any;
          let dateObj = new Date();
          if (data.gameDate instanceof Timestamp) {
            dateObj = data.gameDate.toDate();
          } else if (typeof data.gameDate === 'string') {
            dateObj = new Date(data.gameDate);
          }

          const datePart = dateObj.toLocaleDateString();
          const timePart = dateObj.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          const dateStr = `${datePart} ${timePart}`;

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

  const isDivisionMatch = (division: 'A' | 'B') =>
    division === (isDivisionB ? 'B' : 'A');

  const filteredResults = games.filter(
    (g) =>
      isDivisionMatch(g.division) &&
      g.finalPointsHome !== null &&
      g.finalPointsAway !== null
  );

  const filteredSchedule = scheduledGames.filter((sg) =>
    isDivisionMatch(sg.division)
  );

  const handleGamePress = (game: GameProps) => {
    navigation.navigate('GameDetails', { gameID: game.gameID });
  };

  const renderCompletedGame = ({ item }: { item: GameProps }) => {
    const homeTeamDoc = teams.get(item.homeTeam);
    const awayTeamDoc = teams.get(item.awayTeam);

    if (!homeTeamDoc || !awayTeamDoc) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Missing team data for GameID: {item.gameID}
          </Text>
        </View>
      );
    }

    return (
      <TouchableOpacity style={styles.gameContainer} onPress={() => handleGamePress(item)}>
        <View style={styles.teamRow}>
          <View style={styles.teamInfo}>
            <Image source={{ uri: homeTeamDoc.icon }} style={styles.teamIconResults} />
            <Text style={styles.teamName}>{homeTeamDoc.name}</Text>
          </View>
          <Text style={styles.teamPoints}>{item.finalPointsHome ?? '-'}</Text>
        </View>
        <View style={styles.teamRow}>
          <View style={styles.teamInfo}>
            <Image source={{ uri: awayTeamDoc.icon }} style={styles.teamIconResults} />
            <Text style={styles.teamName}>{awayTeamDoc.name}</Text>
          </View>
          <Text style={styles.teamPoints}>{item.finalPointsAway ?? '-'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderScheduledGame = ({ item }: { item: ScheduledGameProps }) => {
    const homeTeamDoc = teams.get(item.homeTeam);
    const awayTeamDoc = teams.get(item.awayTeam);

    return (
      <View style={styles.gameContainer}>
        <View style={styles.teamRow}> {/* Home Team Row */}
          <Image
            source={{ uri: homeTeamDoc?.icon || '' }}
            style={styles.teamIconScheduled}
          />
          <Text style={styles.teamName}>{homeTeamDoc?.name || item.homeTeam}</Text>
        </View>
    
        <View style={styles.vsText}> {/* VS Row */}
          <Text style={styles.vsText}>vs</Text>
        </View>
    
        <View style={styles.teamRow}> {/* Away Team Row */}
          <Image
            source={{ uri: awayTeamDoc?.icon || '' }}
            style={styles.teamIconScheduled}
          />
          <Text style={styles.teamName}>{awayTeamDoc?.name || item.awayTeam}</Text>
        </View>
    
        <View style={styles.bottomRow}> {/* Bottom Row with Arena and Date */}
          <Text style={styles.arenaText}>
            {item.arena ? `Arena: ${item.arena}` : ''}
          </Text>
          <Text style={styles.gameDateText}>{item.dateStr}</Text>
        </View>
      </View>
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
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
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
    alignItems: 'center',
    marginVertical: 4,
    justifyContent: 'space-between',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamIconResults: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  teamIconScheduled: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 10,
  },
  gameDateText: {
    fontSize: 14,
    color: '#555',
  },
  arenaText: {
    fontSize: 14,
    color: '#555',
    maxWidth: '65%',
  },
  teamPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
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
