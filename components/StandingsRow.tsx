import React from 'react';
import { View, Text, Image } from 'react-native';
import styles from '../app/(tabs)/Styles/StandingsStyles';
import { TeamProps } from '../hooks/useFetchStandings'; // Assuming `TeamProps` is exported from `StandingsScreen`

type StandingsRowProps = {
  team: TeamProps;
  index: number;
  colors: string[];
};

const StandingsRow = ({ team, index, colors }: StandingsRowProps) => {
  return (
    <View style={styles.tableRow}>
      <Text style={[styles.cellText, { color: colors[index] }]}>{index + 1}</Text>
      <View style={styles.teamCell}>
        {team.icon ? (
          <Image source={{ uri: team.icon }} style={styles.teamIcon} />
        ) : (
          <View style={styles.placeholderIcon} />
        )}
        <Text style={styles.teamName}>{team.teamName}</Text>
      </View>
      <Text style={styles.cellText}>{team.gamesPlayed}</Text>
      <Text style={styles.cellText}>{team.wins}</Text>
      <Text style={styles.cellText}>{team.losses}</Text>
      <Text style={styles.cellText}>{team.ptsMinus}</Text>
      <Text style={styles.cellText}>{team.ptsPlus}</Text>
      <Text style={styles.cellText}>{team.ptsDifference}</Text>
      <Text style={styles.cellText}>{team.standingPoints}</Text>
    </View>
  );
};

export default StandingsRow;
