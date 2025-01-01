import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { firestore } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

type TeamProps = {
  docID: string;
  teamName?: string;
  icon?: string;
  division?: string;
  gamesPlayed?: number;
  wins?: number;
  losses?: number;
  ptsMinus?: number;
  ptsPlus?: number;
  ptsDifference?: number;
  standingPoints?: number;
};

type GameProps = {
  gameID?: number;
  homeTeam?: string;
  awayTeam?: string;
  finalPointsHome?: number;
  finalPointsAway?: number;
  winner?: string;
  loser?: string;
};

interface StandingsNavigationProp {
  navigate: (
    screen: string,
    params?: {
      teamName?: string;
    }
  ) => void;
}

const StandingsScreen: React.FC = () => {
  const navigation = useNavigation<StandingsNavigationProp>();
  const [teams, setTeams] = useState<TeamProps[]>([]);
  const [games, setGames] = useState<GameProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDivision, setSelectedDivision] = useState<'A' | 'B-A' | 'B-B'>('A');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const teamsSnapshot = await getDocs(collection(firestore, 'teams'));
      const loadedTeams: TeamProps[] = teamsSnapshot.docs.map((doc) => {
        const data = doc.data() || {};
        return {
          docID: doc.id,
          teamName: data.teamName,
          icon: data.icon,
          division: data.division,
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          ptsMinus: 0,
          ptsPlus: 0,
          ptsDifference: 0,
          standingPoints: 0,
        };
      });

      const gamesSnapshot = await getDocs(collection(firestore, 'games'));
      const loadedGames: GameProps[] = gamesSnapshot.docs.map((doc) => {
        const data = doc.data() || {};
        return {
          gameID: data.gameID,
          homeTeam: data.homeTeam,
          awayTeam: data.awayTeam,
          finalPointsHome: data.finalPointsHome,
          finalPointsAway: data.finalPointsAway,
          winner: data.winner,
          loser: data.loser,
        };
      });

      const teamMap = new Map<string, TeamProps>();
      loadedTeams.forEach((t) => {
        teamMap.set(t.docID, t);
      });

      for (const g of loadedGames) {
        if (!g.homeTeam || !g.awayTeam || !g.winner || !g.loser) continue;

        const home = teamMap.get(g.homeTeam);
        const away = teamMap.get(g.awayTeam);
        const winT = teamMap.get(g.winner);
        const loseT = teamMap.get(g.loser);

        if (home && away && g.finalPointsHome !== undefined && g.finalPointsAway !== undefined) {
          home.ptsPlus = (home.ptsPlus ?? 0) + g.finalPointsHome;
          home.ptsMinus = (home.ptsMinus ?? 0) + g.finalPointsAway;
          away.ptsPlus = (away.ptsPlus ?? 0) + g.finalPointsAway;
          away.ptsMinus = (away.ptsMinus ?? 0) + g.finalPointsHome;
        }

        if (winT) {
          winT.wins = (winT.wins ?? 0) + 1;
          winT.standingPoints = (winT.standingPoints ?? 0) + 2;
        }
        if (loseT) {
          loseT.losses = (loseT.losses ?? 0) + 1;
          loseT.standingPoints = (loseT.standingPoints ?? 0) + 1;
        }
      }

      teamMap.forEach((t) => {
        t.ptsDifference = (t.ptsPlus ?? 0) - (t.ptsMinus ?? 0);
        t.gamesPlayed = (t.wins ?? 0) + (t.losses ?? 0);
      });

      setTeams(Array.from(teamMap.values()));
      setGames(loadedGames);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDivision]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDivisionChange = (division: 'A' | 'B-A' | 'B-B') => {
    setSelectedDivision(division);
  };

  const sortTeams = (divisionTeams: TeamProps[]) => {
    return [...divisionTeams].sort((a, b) => {
      if ((b.standingPoints ?? 0) !== (a.standingPoints ?? 0)) {
        return (b.standingPoints ?? 0) - (a.standingPoints ?? 0);
      }
      if ((b.ptsDifference ?? 0) !== (a.ptsDifference ?? 0)) {
        return (b.ptsDifference ?? 0) - (a.ptsDifference ?? 0);
      }
      return (a.teamName ?? '').localeCompare(b.teamName ?? '');
    });
  };

  const getPlaceTextColor = (place: number, division: string | undefined) => {
    if (division === 'A') {
      if (place >= 1 && place <= 4) return { color: 'green' };
      if (place >= 5 && place <= 12) return { color: 'yellow' };
      if (place === 13 || place === 14) return { color: 'black' };
      if (place === 15 || place === 16) return { color: 'red' };
    } else if (division?.startsWith('B')) {
      if (place >= 1 && place <= 8) return { color: 'green' };
      if (place >= 9 && place <= 13) return { color: 'black' };
    }
    return {};
  };

  const renderStandings = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading teams...</Text>
        </View>
      );
    }

    const divisionTeams = teams.filter((t) => t.division === selectedDivision);
    const rowsCount = selectedDivision === 'A' ? 16 : 13;
    const sorted = sortTeams(divisionTeams);
    const tableRows = Array.from({ length: rowsCount }, (_, i) => {
      const t = sorted[i];
      return { place: i + 1, team: t };
    });

    return (
      <View style={styles.tableContainer}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.headerCell, { flex: 0.5, textAlign: 'left' }]}>#</Text>
          <Text style={[styles.headerCell, { flex: 2, textAlign: 'left' }]}>Team</Text>
          <Text style={[styles.headerCell, { flex: 0.6, textAlign: 'right' }]}>GP</Text>
          <Text style={[styles.headerCell, { flex: 0.6, textAlign: 'right' }]}>W</Text>
          <Text style={[styles.headerCell, { flex: 0.6, textAlign: 'right' }]}>L</Text>
          <Text style={[styles.headerCell, { flex: 0.8, textAlign: 'right' }]}>Pts-</Text>
          <Text style={[styles.headerCell, { flex: 0.8, textAlign: 'right' }]}>Pts+</Text>
          <Text style={[styles.headerCell, { flex: 0.8, textAlign: 'right' }]}>Diff</Text>
          <Text style={[styles.headerCell, { flex: 0.6, textAlign: 'right' }]}>P</Text>
        </View>

        <FlatList
          data={tableRows}
          keyExtractor={(item) => item.place.toString()}
          renderItem={({ item }) => {
            const { place, team } = item;
            if (!team) {
              return (
                <View style={styles.tableRow}>
                  <Text style={[styles.cellText, { flex: 0.5 }]}> {place}</Text>
                  <Text style={[styles.cellText, { flex: 2 }]}>No Team</Text>
                </View>
              );
            }
            const colorStyle = getPlaceTextColor(place, team.division);
            return (
              <Pressable
                style={styles.tableRow}
                onPress={() => {
                  // Pass the docID as "teamName"
                  navigation.navigate('TeamScreen', {
                    teamName: team.docID,
                  });
                }}
              >
                <Text style={[styles.cellText, { flex: 0.5 }, colorStyle]}>{place}</Text>

                {/* Team name & icon */}
                <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
                  {team.icon ? (
                    <Image source={{ uri: team.icon }} style={styles.teamIcon} />
                  ) : (
                    <View style={styles.placeholderIcon} />
                  )}
                  <Text
                    style={[styles.cellText, styles.teamName]}
                    numberOfLines={1}
                  >
                    {team.teamName ?? 'Unnamed'}
                  </Text>
                </View>

                {/* Right-aligned numeric fields */}
                <Text style={[styles.cellText, styles.numCell, { flex: 0.6 }]}>
                  {team.gamesPlayed ?? 0}
                </Text>
                <Text style={[styles.cellText, styles.numCell, { flex: 0.6 }]}>
                  {team.wins ?? 0}
                </Text>
                <Text style={[styles.cellText, styles.numCell, { flex: 0.6 }]}>
                  {team.losses ?? 0}
                </Text>
                <Text style={[styles.cellText, styles.numCell, { flex: 0.8 }]}>
                  {team.ptsMinus ?? 0}
                </Text>
                <Text style={[styles.cellText, styles.numCell, { flex: 0.8 }]}>
                  {team.ptsPlus ?? 0}
                </Text>
                <Text style={[styles.cellText, styles.numCell, { flex: 0.8 }]}>
                  {team.ptsDifference ?? 0}
                </Text>
                <Text style={[styles.cellText, styles.numCell, { flex: 0.6 }]}>
                  {team.standingPoints ?? 0}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.buttonContainer}>
        <Pressable
          style={[
            styles.divisionButton,
            selectedDivision === 'A' && styles.divisionButtonSelected,
          ]}
          onPress={() => handleDivisionChange('A')}
        >
          <Text style={styles.buttonText}>A Division</Text>
        </Pressable>
        <Pressable
          style={[
            styles.divisionButton,
            selectedDivision === 'B-A' && styles.divisionButtonSelected,
          ]}
          onPress={() => handleDivisionChange('B-A')}
        >
          <Text style={styles.buttonText}>B Division-A</Text>
        </Pressable>
        <Pressable
          style={[
            styles.divisionButton,
            selectedDivision === 'B-B' && styles.divisionButtonSelected,
          ]}
          onPress={() => handleDivisionChange('B-B')}
        >
          <Text style={styles.buttonText}>B Division-B</Text>
        </Pressable>
      </View>

      {renderStandings()}
    </SafeAreaView>
  );
};

export default StandingsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#000',
  },
  divisionButton: {
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
  },
  divisionButtonSelected: {
    backgroundColor: '#0000ff',
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  loadingContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  tableContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  tableHeader: {
    backgroundColor: '#ccc',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
    paddingVertical: 4,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  cellText: {
    fontSize: 12,
    color: '#000',
  },
  teamIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 4,
  },
  placeholderIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ccc',
    marginRight: 4,
  },
  teamName: {
    fontWeight: '600',
    flexShrink: 1,
  },
  numCell: {
    textAlign: 'right',
  },
});
