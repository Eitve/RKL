import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { firestore } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import Team from '../../components/team';

type PlayerProps = {
  firstName: string;
  lastName: string;
  dob?: string;
  position?: string;
  age?: number;
  nationality?: string;
  height?: number;
  weight?: number;
  shirtNumber?: number | null;
  photoURL?: string;
};

type TeamProps = {
  id: string;
  teamName: string;
  icon: string;
  players: PlayerProps[];
};

const Statistics: React.FC = () => {
  const [teams, setTeams] = useState<TeamProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamsWithPlayers = async () => {
      try {
        const teamsCollection = collection(firestore, 'teams');
        const teamSnapshot = await getDocs(teamsCollection);

        // Fetch all teams and their players
        const teamsList: TeamProps[] = await Promise.all(
          teamSnapshot.docs.map(async (teamDoc) => {
            const teamData = teamDoc.data() as Partial<Omit<TeamProps, 'id' | 'players'>>;

            // Default values for missing team data
            const teamName = teamData.teamName || 'Unknown Team';
            const icon = teamData.icon || '';

            const playersCollection = collection(firestore, `teams/${teamDoc.id}/players`);
            const playersSnapshot = await getDocs(playersCollection);

            const playersList: PlayerProps[] = playersSnapshot.docs.map((playerDoc) => {
              const playerData = playerDoc.data();

              // Fallback for missing player fields
              return {
                firstName: playerData.firstName || 'N/A',
                lastName: playerData.lastName || 'N/A',
                dob: playerData.dob || 'N/A',
                position: playerData.position || 'N/A',
                age: playerData.age || 0,
                nationality: playerData.nationality || 'N/A',
                height: playerData.height || 0,
                weight: playerData.weight || 0,
                shirtNumber: playerData.shirtNumber ?? null,
                photoURL: playerData.photoURL || '',
              };
            });

            return { id: teamDoc.id, teamName, icon, players: playersList };
          })
        );

        // Update state with the complete list of teams and players
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
