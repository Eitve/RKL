import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';   // ⌄ chevron

type Props = {
  label: string;          // “STAT”
  value: string;          // “PPG” / “ALL” / …
  onPress: () => void;
};

export const FilterPill: React.FC<Props> = ({ label, value, onPress }) => (
  <TouchableOpacity style={styles.pill} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.label}>{label}: </Text>
    <Text style={styles.value}>{value}</Text>
    <Feather name="chevron-down" size={16} color="#fff" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#265C3A',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 9999,            // ← makes it fully rounded
    marginHorizontal: 6,
    elevation: 3,                  // Android shadow
    shadowColor: '#000',           // iOS shadow
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  label: { color: '#fff', fontWeight: '600', fontSize: 14 },
  value: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
