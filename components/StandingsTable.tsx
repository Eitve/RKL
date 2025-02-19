import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import TableHeader from './TableHeader';
import TeamRow from './TeamRow';

interface TeamData {
  place: number;
  team: any;
}

interface StandingsTableProps {
  tableRows: TeamData[];
  showDetails: boolean;
  onRowPress: (team: any) => void;
  getPlaceTextColor: (place: number, division?: string) => object;
}

const StandingsTable: React.FC<StandingsTableProps> = ({
  tableRows,
  showDetails,
  onRowPress,
  getPlaceTextColor,
}) => {
  return (
    <View style={styles.tableContainer}>
      <TableHeader showDetails={showDetails} />
      <FlatList
        data={tableRows}
        keyExtractor={(item) => item.place.toString()}
        renderItem={({ item }) => {
          const { place, team } = item;
          if (!team) {
            return (
              <View style={styles.tableRow}>
                <Text style={[styles.cellText, { flex: 0.5 }]}>{place}</Text>
                <Text style={[styles.cellText, { flex: 2 }]}>No Team</Text>
              </View>
            );
          }
          return (
            <TeamRow
              place={place}
              team={team}
              showDetails={showDetails}
              onPress={() => onRowPress(team)}
              getPlaceTextColor={getPlaceTextColor}
            />
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
    paddingVertical: 4,
  },
  cellText: {
    fontSize: 12,
    color: '#000',
  },
});

export default StandingsTable;
