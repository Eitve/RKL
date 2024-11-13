import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import HomeScreen from './index'; // Ensure this is the correct import for the home screen
import NewsDetailScreen from './NewsDetailScreen'; // Ensure this is the correct import for the details screen
import StandingsScreen from './standings';

const Tab = createBottomTabNavigator();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* Use Tab.Navigator for bottom tab navigation */}
      <Tab.Navigator>
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} // Use HomeScreen as the component for the Home tab
          options={{ tabBarLabel: 'Home' }} 
        />
        <Tab.Screen 
          name="Standings" 
          component={StandingsScreen} 
          options={{ tabBarLabel: 'Standings' }} 
        />
        {/* Add more tabs here if needed */}
      </Tab.Navigator>
    </ThemeProvider>
  );
}
