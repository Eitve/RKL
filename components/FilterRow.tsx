import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

type FilterRowProps = {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
};

const FilterRow: React.FC<FilterRowProps> = ({ options, selected, onSelect }) => {
  return (
    <View style={styles.filterRow}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.filterButton,
            selected === option && styles.filterButtonSelected,
          ]}
          onPress={() => onSelect(option)}
        >
          <Text style={styles.filterButtonText}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 5,
    flexWrap: 'wrap',
  },
  filterButton: {
    backgroundColor: '#ccc',
    padding: 8,
    margin: 4,
    borderRadius: 4,
  },
  filterButtonSelected: {
    backgroundColor: '#007bff',
  },
  filterButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default FilterRow;