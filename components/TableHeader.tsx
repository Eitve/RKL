import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TableHeaderProps {
  showDetails: boolean;
}

const TableHeader: React.FC<TableHeaderProps> = ({ showDetails }) => {
  return (
    <View style={[styles.tableRow, styles.tableHeader]}>
      <Text style={[styles.headerCell, { flex: 0.5, textAlign: 'left' }]}>#</Text>
      <Text style={[styles.headerCell, { flex: 2, textAlign: 'left' }]}>Team</Text>
      <Text style={[styles.headerCell, { flex: 0.6, textAlign: 'right' }]}>GP</Text>
      <Text style={[styles.headerCell, { flex: 0.6, textAlign: 'right' }]}>W</Text>
      <Text style={[styles.headerCell, { flex: 0.6, textAlign: 'right' }]}>L</Text>
      {showDetails && (
        <>
          <Text style={[styles.headerCell, { flex: 0.8, textAlign: 'right' }]}>Pts-</Text>
          <Text style={[styles.headerCell, { flex: 0.8, textAlign: 'right' }]}>Pts+</Text>
          <Text style={[styles.headerCell, { flex: 0.8, textAlign: 'right' }]}>Diff</Text>
        </>
      )}
      <Text style={[styles.headerCell, { flex: 0.6, textAlign: 'right' }]}>P</Text>
    </View>
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
  tableHeader: {
    backgroundColor: '#ccc',
  },
  headerCell: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default TableHeader;
