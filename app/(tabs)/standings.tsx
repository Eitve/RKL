import React, { useState } from 'react';
import { SafeAreaView, View, Text, FlatList, ActivityIndicator, Pressable } from 'react-native';
import styles from './Styles/StandingsStyles';
import { useFetchStandings, TeamProps } from '../../hooks/useFetchStandings';
import StandingsRow from '../../components/StandingsRow';

const TABLE_HEADERS = ['#', 'Team', 'GP', 'W', 'L', 'Pts-', 'Pts+', 'Diff', 'P'];

const PLACE_COLORS_A = [
  'green', 'green', 'green', 'green', // 1-4: Guaranteed Playoff
  'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', // 5-12: Play-In Tournament
  'black', 'black', // 13-14: No Playoffs/Relegation
  'red', 'red', // 15-16: Relegation
];

const PLACE_COLORS_B = [
  'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', // 1-8: Top Division
  'black', 'black', 'black', 'black', 'black', // 9-13: No Playoffs
];

function getPlaceColors(division: 'A' | 'B-A' | 'B-B') {
  return division === 'A' ? PLACE_COLORS_A : PLACE_COLORS_B;
}

const StandingsScreen = () => {
  const { teams, loading } = useFetchStandings();
  const [selectedDivision, setSelectedDivision] = useState<'A' | 'B-A' | 'B-B'>('A');

  const renderStandings = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading teams...</Text>
        </View>
      );
    }

    const divisionTeams = teams.filter((team) => team.division === selectedDivision);
    const sortedTeams = divisionTeams.sort((a, b) => b.standingPoints - a.standingPoints);
    const colors = getPlaceColors(selectedDivision);

    return (
      <View style={styles.tableContainer}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          {TABLE_HEADERS.map((header) => (
            <Text key={header} style={[styles.cellText, styles.headerCell]}>
              {header}
            </Text>
          ))}
        </View>
        <FlatList
          data={sortedTeams}
          keyExtractor={(team, index) => `${team.id}-${index}`}
          renderItem={({ item, index }) => (
            <StandingsRow team={item} index={index} colors={colors} />
          )}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.buttonContainer}>
        {(['A', 'B-A', 'B-B'] as const).map((division) => (
          <Pressable
            key={division}
            style={[
              styles.divisionButton,
              selectedDivision === division && styles.divisionButtonSelected,
            ]}
            onPress={() => setSelectedDivision(division)}
          >
            <Text style={styles.buttonText}>{division} Division</Text>
          </Pressable>
        ))}
      </View>
      {renderStandings()}
    </SafeAreaView>
  );
};

export default StandingsScreen;
