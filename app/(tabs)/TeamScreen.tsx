import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';
import Team from '../../components/team';

type StandingsStackParamList = {
  StandingsMain: undefined;
  TeamScreen: { teamName: string };
};

type TeamScreenRouteProp = RouteProp<StandingsStackParamList, 'TeamScreen'>;

const TeamScreen: React.FC = () => {
  const route = useRoute<TeamScreenRouteProp>();
  const { teamName } = route.params;

  return (
    <View style={styles.container}>
      <Team teamName={teamName} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default TeamScreen;
