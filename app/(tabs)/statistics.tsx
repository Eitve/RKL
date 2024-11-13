// statistics.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { firestore } from '../firebaseConfig'; // Import Firestore configuration
import { collection, getDocs } from 'firebase/firestore';
import Team from '../../components/team';

type PlayerProps = {
  firstName: string;
  lastName: string;
};

type TeamProps = {
  id: string; // Document ID from Firestore
  teamName: string;
  icon: string; // URL for the team icon
  players: PlayerProps[]; // Players array will be fetched and added
};

const Statistics: React.FC = () => {
  const [teams, setTeams] = useState<TeamProps[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch teams from Firestore
  useEffect(() => {
    const fetchTeamsWithPlayers = async () => {
      try {
        const teamsCollection = collection(firestore, 'teams');
        const teamSnapshot = await getDocs(teamsCollection);
        
        // Fetch players for each team document
        const teamsList: TeamProps[] = await Promise.all(
          teamSnapshot.docs.map(async (teamDoc) => {
            const teamData = teamDoc.data() as Omit<TeamProps, 'id' | 'players'>;
            const playersCollection = collection(firestore, `teams/${teamDoc.id}/players`);
            const playersSnapshot = await getDocs(playersCollection);

            const playersList: PlayerProps[] = playersSnapshot.docs.map((playerDoc) => {
              return playerDoc.data() as PlayerProps;
            });

            return { id: teamDoc.id, ...teamData, players: playersList };
          })
        );

        setTeams(teamsList);
      } catch (error) {
        console.error('Error fetching teams and players:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamsWithPlayers();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading teams...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statistics</Text>
      
      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Team teamName={item.teamName} icon={item.icon} players={item.players} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Statistics;