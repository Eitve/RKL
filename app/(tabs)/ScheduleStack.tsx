import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ScheduleScreen from './schedule';
import GameDetailsScreen from './GameDetailScreen';

export type ScheduleStackParamList = {
  ScheduleMain: undefined;
  GameDetails: { gameID: number };
};

const Stack = createNativeStackNavigator<ScheduleStackParamList>();

export default function ScheduleStackScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ScheduleMain"
        component={ScheduleScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GameDetails"
        component={GameDetailsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
