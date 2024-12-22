import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, View, Text, Image, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { firestore } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { StyleSheet } from 'react-native';

type TeamProps = {
  id: string;           // normalized ID that matches what is used in the games
  teamName: string;
  icon: string;
  division: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  ptsMinus: number;
  ptsPlus: number;
  ptsDifference: number;
  standingPoints: number;
};

type GameProps = {
  gameID: number;
  homeTeam: string;   // normalized team ID
  awayTeam: string;   // normalized team ID
  finalPointsHome: number;
  finalPointsAway: number;
  winner: string;     // normalized team ID
  loser: string;      // normalized team ID
};

// Function to normalize a team name doc ID to match the format used in the games
// For example: "BC Radviliškis" -> "bcradviliskis"
// We'll remove spaces, convert to lowercase, and remove diacritics.
function normalizeID(input: string): string {
  // Convert to lowercase
  let normalized = input.toLowerCase();
  // Remove accents/diacritics like š, į, etc.
  // A simple replace for known diacritics:
  normalized = normalized
    .replace(/ą/g, 'a')
    .replace(/č/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ė/g, 'e')
    .replace(/į/g, 'i')
    .replace(/š/g, 's')
    .replace(/ų/g, 'u')
    .replace(/ū/g, 'u')
    .replace(/ž/g, 'z');
  // Remove any non-alphanumeric characters except maybe keep them if needed
  // We'll just remove spaces and punctuation:
  normalized = normalized.replace(/\s+/g, ''); // remove spaces
  return normalized;
}

function getPlaceTextColor(place: number, division: string) {
  if (division === 'A') {
    if (place >= 1 && place <= 4) return { color: 'green' };
    if (place >= 5 && place <= 12) return { color: 'yellow' };
    if (place === 13 || place === 14) return { color: 'black' };
    if (place === 15 || place === 16) return { color: 'red' };
  } else {
    // B divisions
    if (place >= 1 && place <= 8) return { color: 'green' };
    if (place >= 9 && place <= 13) return { color: 'black' };
  }
  return {};
}

function sortTeams(divisionTeams: TeamProps[]) {
  return divisionTeams.sort((a, b) => {
    if (b.standingPoints !== a.standingPoints) return b.standingPoints - a.standingPoints;
    if (b.ptsDifference !== a.ptsDifference) return b.ptsDifference - a.ptsDifference;
    return a.teamName.localeCompare(b.teamName);
  });
}

const StandingsScreen = () => {
  const [teams, setTeams] = useState<TeamProps[]>([]);
  const [games, setGames] = useState<GameProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDivision, setSelectedDivision] = useState<'A' | 'B-A' | 'B-B'>('A');

  const fetchData = useCallback(async () => {
    try {
      console.log('Fetching data and recalculating stats for division:', selectedDivision);
      setLoading(true);

      const teamsCollection = collection(firestore, 'teams');
      const teamSnapshot = await getDocs(teamsCollection);
      let teamsList: TeamProps[] = teamSnapshot.docs.map((doc) => {
        const data = doc.data() as any;

        const teamNormalizedID = normalizeID(doc.id);

        return {
          id: teamNormalizedID,
          teamName: data.teamName || doc.id, // Use doc.id as fallback if no teamName
          icon: data.icon || '',
          division: typeof data.division === 'string' ? data.division.trim() : '',
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          ptsMinus: 0,
          ptsPlus: 0,
          ptsDifference: 0,
          standingPoints: 0,
        };
      });

      const gamesCollection = collection(firestore, 'games');
      const gameSnapshot = await getDocs(gamesCollection);
      const gamesList: GameProps[] = gameSnapshot.docs.map((doc) => {
        const data = doc.data() as any;
        return {
          gameID: data.gameID || 0,
          homeTeam: normalizeID(data.homeTeam || ''),
          awayTeam: normalizeID(data.awayTeam || ''),
          finalPointsHome: data.finalPointsHome || 0,
          finalPointsAway: data.finalPointsAway || 0,
          winner: normalizeID(data.winner || ''),
          loser: normalizeID(data.loser || ''),
        };
      });

      const teamMap = new Map<string, TeamProps>();
      teamsList.forEach((team) => {
        teamMap.set(team.id, team);
      });

      for (const game of gamesList) {
        const {
          homeTeam,
          awayTeam,
          finalPointsHome,
          finalPointsAway,
          winner,
          loser,
        } = game;

        const home = teamMap.get(homeTeam);
        const away = teamMap.get(awayTeam);

        if (!home || !away) {
          console.warn('Game references unknown team:', game);
          continue;
        }

        home.ptsPlus += finalPointsHome;
        home.ptsMinus += finalPointsAway;
        away.ptsPlus += finalPointsAway;
        away.ptsMinus += finalPointsHome;

        const winnerTeam = teamMap.get(winner);
        const loserTeam = teamMap.get(loser);

        if (winnerTeam) {
          winnerTeam.wins += 1;
          winnerTeam.standingPoints += 2; // winner gets +2 points
        } else {
          console.warn('No winner team found for game:', game);
        }

        if (loserTeam) {
          loserTeam.losses += 1;
          loserTeam.standingPoints += 1; // loser gets +1 point
        } else {
          console.warn('No loser team found for game:', game);
        }
      }

      for (const t of teamsList) {
        t.ptsDifference = t.ptsPlus - t.ptsMinus;
        t.gamesPlayed = t.wins + t.losses;
      }

      setTeams(teamsList);
      setGames(gamesList);

      console.log('Updated Teams after calculation:', teamsList);

    } catch (error) {
      console.error('Error fetching data:', error);
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

  const renderStandings = () => {
    if (loading) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{color: '#000', fontSize: 16, marginTop: 10}}>Loading teams...</Text>
        </View>
      );
    }

    const divisionTeams = teams.filter((team) => team.division === selectedDivision);
    const rowsCount = selectedDivision === 'A' ? 16 : 13;
    const sortedTeams = sortTeams(divisionTeams);
    const tableRows = Array.from({ length: rowsCount }, (_, i) => {
      const team = sortedTeams[i];
      return { place: i + 1, team };
    });

    console.log('Teams in Division:', selectedDivision, divisionTeams);
    console.log('Sorted Teams in Division:', sortedTeams);

    return (
      <View style={{flex: 1, paddingHorizontal: 10, paddingVertical: 10}}>
        <View style={{flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ddd', alignItems: 'center', paddingVertical: 5, backgroundColor: '#ccc'}}>
          <View style={{marginHorizontal: 5}}><Text style={{fontSize: 14, fontWeight: 'bold'}}>#</Text></View>
          <View style={{marginHorizontal: 5}}><Text style={{fontSize: 14, fontWeight: 'bold'}}>Team</Text></View>
          <View style={{marginHorizontal: 5}}><Text style={{fontSize: 14, fontWeight: 'bold'}}>GP</Text></View>
          <View style={{marginHorizontal: 5}}><Text style={{fontSize: 14, fontWeight: 'bold'}}>W</Text></View>
          <View style={{marginHorizontal: 5}}><Text style={{fontSize: 14, fontWeight: 'bold'}}>L</Text></View>
          <View style={{marginHorizontal: 5}}><Text style={{fontSize: 14, fontWeight: 'bold'}}>Pts-</Text></View>
          <View style={{marginHorizontal: 5}}><Text style={{fontSize: 14, fontWeight: 'bold'}}>Pts+</Text></View>
          <View style={{marginHorizontal: 5}}><Text style={{fontSize: 14, fontWeight: 'bold'}}>Diff</Text></View>
          <View style={{marginHorizontal: 5}}><Text style={{fontSize: 14, fontWeight: 'bold'}}>P</Text></View>
        </View>

        <FlatList
          data={tableRows}
          keyExtractor={(item) => item.place.toString()}
          renderItem={({ item }) => {
            const { place, team } = item;
            if (!team) {
              return (
                <View style={styles.tableRow}>
                  <View style={styles.cell}><Text style={styles.cellText}>{place}</Text></View>
                  <Text style={styles.cellText}>No Team</Text>
                </View>
              );
            }
          
            const placeColor = getPlaceTextColor(place, team.division);
          
            return (
              <View style={styles.tableRow}>
                <View style={styles.cell}><Text style={[styles.cellText, placeColor]}>{place}</Text></View>
                <View style={[styles.teamCell, { flex: 2 }]}>
                  {team.icon ? (
                    <Image source={{ uri: team.icon }} style={styles.teamIcon} />
                  ) : (
                    <View style={styles.placeholderIcon} />
                  )}
                  <Text style={styles.teamName} numberOfLines={2}>
                    {team.teamName}
                  </Text>
                </View>
                <View style={styles.cell}><Text style={styles.cellText}>{team.gamesPlayed}</Text></View>
                <View style={styles.cell}><Text style={styles.cellText}>{team.wins}</Text></View>
                <View style={styles.cell}><Text style={styles.cellText}>{team.losses}</Text></View>
                <View style={styles.cell}><Text style={styles.cellText}>{team.ptsMinus}</Text></View>
                <View style={styles.cell}><Text style={styles.cellText}>{team.ptsPlus}</Text></View>
                <View style={styles.cell}><Text style={styles.cellText}>{team.ptsDifference}</Text></View>
                <View style={styles.cell}><Text style={styles.cellText}>{team.standingPoints}</Text></View>
              </View>
            );

          }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex:1, backgroundColor:'#fff'}}>
      <View style={{flexDirection:'row', justifyContent:'space-around', paddingVertical:10, backgroundColor:'#000'}}>
        <Pressable
          style={{padding:10, backgroundColor: selectedDivision==='A' ? '#0000ff':'#ccc', borderRadius:5}}
          onPress={() => handleDivisionChange('A')}
        >
          <Text style={{color:'#000', fontWeight:'bold'}}>A Division</Text>
        </Pressable>
        <Pressable
          style={{padding:10, backgroundColor: selectedDivision==='B-A' ? '#0000ff':'#ccc', borderRadius:5}}
          onPress={() => handleDivisionChange('B-A')}
        >
          <Text style={{color:'#000', fontWeight:'bold'}}>B Division-A</Text>
        </Pressable>
        <Pressable
          style={{padding:10, backgroundColor: selectedDivision==='B-B' ? '#0000ff':'#ccc', borderRadius:5}}
          onPress={() => handleDivisionChange('B-B')}
        >
          <Text style={{color:'#000', fontWeight:'bold'}}>B Division-B</Text>
        </Pressable>
      </View>
      {renderStandings()}
    </SafeAreaView>
  );
};

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
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#000',
    fontSize: 16,
    marginTop: 10,
  },
  tableContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
    paddingVertical: 5,
  },
  tableHeader: {
    backgroundColor: '#ccc',
  },
  headerCell: {
    marginHorizontal: 5,
    alignSelf: 'flex-start',
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  cell: {
    alignSelf: 'flex-start',
    marginHorizontal: 5,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'left',
  },
  teamIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  placeholderIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
  },
  teamCell: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  teamName: {
    fontSize: 14,
    color: '#000',
    marginLeft: 5,
  },
});

export default StandingsScreen;
