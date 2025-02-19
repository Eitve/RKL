import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, View, Text, ActivityIndicator, Switch, StyleSheet, } from 'react-native';
import { firestore } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { TeamProps, GameProps } from '../../types';
import DivisionSelector, { Division } from '../../components/DivisionSelector';
import StandingsTable from '../../components/StandingsTable';
import { sortTeams, getPlaceTextColor } from '../../components/gameUtils';
import styles from '../Styles/StandingsStyles'

interface StandingsNavigationProp {
  navigate: (screen: string, params?: { teamName?: string }) => void;
}

const StandingsScreen: React.FC = () => {
  const navigation = useNavigation<StandingsNavigationProp>();
  const [teams, setTeams] = useState<TeamProps[]>([]);
  const [games, setGames] = useState<GameProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDivision, setSelectedDivision] = useState<Division>('A');
  const [showDetails, setShowDetails] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const teamsSnapshot = await getDocs(collection(firestore, 'teams'));
      const loadedTeams: TeamProps[] = teamsSnapshot.docs.map((doc) => {
        const data = doc.data() || {};
        return {
          id: doc.id,
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
          division: data.division,
          winner: data.winner,
          loser: data.loser,
        };
      });

      const teamMap = new Map<string, TeamProps>();
      loadedTeams.forEach((t) => {
        teamMap.set(t.id, t);
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

  const handleDivisionChange = (division: Division) => {
    setSelectedDivision(division);
  };

  const handleRowPress = (team: TeamProps) => {
    navigation.navigate('TeamScreen', { teamName: team.id });
  };

  const renderContent = () => {
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
    const sortedTeams = sortTeams(divisionTeams);
    const tableRows = Array.from({ length: rowsCount }, (_, i) => {
      const t = sortedTeams[i];
      return { place: i + 1, team: t };
    });

    return (
      <StandingsTable
        tableRows={tableRows}
        showDetails={showDetails}
        onRowPress={handleRowPress}
        getPlaceTextColor={getPlaceTextColor}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <DivisionSelector
        selectedDivision={selectedDivision}
        onSelectDivision={handleDivisionChange}
      />
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Details</Text>
        <Switch value={showDetails} onValueChange={(val) => setShowDetails(val)} />
      </View>
      {renderContent()}
    </SafeAreaView>
  );
};

export default StandingsScreen;