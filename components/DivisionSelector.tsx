import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';

export type Division = 'A' | 'B-A' | 'B-B';

interface DivisionSelectorProps {
  selectedDivision: Division;
  onSelectDivision: (division: Division) => void;
}

const DivisionSelector: React.FC<DivisionSelectorProps> = ({
  selectedDivision,
  onSelectDivision,
}) => {
  return (
    <View style={styles.buttonContainer}>
      <Pressable
        style={[styles.divisionButton, selectedDivision === 'A' && styles.divisionButtonSelected]}
        onPress={() => onSelectDivision('A')}
      >
        <Text style={styles.buttonText}>A Division</Text>
      </Pressable>
      <Pressable
        style={[styles.divisionButton, selectedDivision === 'B-A' && styles.divisionButtonSelected]}
        onPress={() => onSelectDivision('B-A')}
      >
        <Text style={styles.buttonText}>B Division-A</Text>
      </Pressable>
      <Pressable
        style={[styles.divisionButton, selectedDivision === 'B-B' && styles.divisionButtonSelected]}
        onPress={() => onSelectDivision('B-B')}
      >
        <Text style={styles.buttonText}>B Division-B</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default DivisionSelector;
