import React from 'react';
import { Pressable, View, Text, Image, StyleSheet } from 'react-native';

export interface TeamRowProps {
  place: number;
  team: any;
  showDetails: boolean;
  onPress: () => void;
  getPlaceTextColor: (place: number, division?: string) => object;
}

const TeamRow: React.FC<TeamRowProps> = ({
  place,
  team,
  showDetails,
  onPress,
  getPlaceTextColor,
}) => {
  const colorStyle = getPlaceTextColor(place, team.division);
  return (
    <Pressable style={styles.tableRow} onPress={onPress}>
      <Text style={[styles.cellText, { flex: 0.5 }, colorStyle]}>{place}</Text>
      <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
        {team.icon ? (
          <Image source={{ uri: team.icon }} style={styles.teamIcon} />
        ) : (
          <View style={styles.placeholderIcon} />
        )}
        <Text style={[styles.cellText, styles.teamName]}>
          {team.teamName ?? 'Unnamed'}
        </Text>
      </View>
      <Text style={[styles.cellText, styles.numCell, { flex: 0.6 }]}>{team.gamesPlayed ?? 0}</Text>
      <Text style={[styles.cellText, styles.numCell, { flex: 0.6 }]}>{team.wins ?? 0}</Text>
      <Text style={[styles.cellText, styles.numCell, { flex: 0.6 }]}>{team.losses ?? 0}</Text>
      {showDetails && (
        <>
          <Text style={[styles.cellText, styles.numCell, { flex: 0.8 }]}>{team.ptsMinus ?? 0}</Text>
          <Text style={[styles.cellText, styles.numCell, { flex: 0.8 }]}>{team.ptsPlus ?? 0}</Text>
          <Text style={[styles.cellText, styles.numCell, { flex: 0.8 }]}>{team.ptsDifference ?? 0}</Text>
        </>
      )}
      <Text style={[styles.cellText, styles.numCell, { flex: 0.6 }]}>{team.standingPoints ?? 0}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
    paddingVertical: 4,
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
    flex: 1,
    flexWrap: 'wrap',
  },
  numCell: {
    textAlign: 'right',
  },
});

export default TeamRow;
