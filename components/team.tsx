import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  FlatList,
} from 'react-native';
import { firestore } from '../app/firebaseConfig';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

interface Team {
  teamName?: string;
  icon?: string;
  teamPhoto?: string;
  headCoach?: string;
  assistantCoach?: string;
  teamManager?: string;
}

interface PlayerData {
  id: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
}

interface TeamScreenNav {
  navigate: (
    screenName: string,
    params?: { playerID?: string }
  ) => void;
}

const Team: React.FC<{ teamName: string }> = ({ teamName }) => {
  const navigation = useNavigation<TeamScreenNav>();
  const [teamData, setTeamData] = useState<Team | null>(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);

        const teamDocRef = doc(firestore, 'teams', teamName);
        const teamDoc = await getDoc(teamDocRef);

        if (teamDoc.exists()) {
          setTeamData(teamDoc.data() as Team);
        } else {
          setTeamData({});
        }

        const playersColl = collection(firestore, `teams/${teamName}/players`);
        const playersSnap = await getDocs(playersColl);
        const loadedPlayers: PlayerData[] = playersSnap.docs.map((p) => {
          const playerData = p.data() as PlayerData;
          return {
            ...playerData,
            id: p.id,
          };
        });

        setPlayers(loadedPlayers);
      } catch (err) {
        console.error('Error fetching team data:', err);
        setTeamData({});
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamName]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!teamData) {
    return <Text>No team data found.</Text>;
  }

  const renderPlayer = ({ item }: { item: PlayerData }) => (
    <Pressable
      key={item.id}
      onPress={() => navigation.navigate('PlayerScreen', { playerID: item.id })}
      style={styles.playerRow}
    >
      {item.photoURL ? (
        <Image source={{ uri: item.photoURL }} style={styles.playerImage} />
      ) : (
        <View style={[styles.playerImage, { backgroundColor: '#ccc' }]} />
      )}
      <Text style={styles.playerName}>
        {item.firstName ?? 'Unknown'} {item.lastName ?? ''}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {teamData.teamPhoto && (
        <Image source={{ uri: teamData.teamPhoto }} style={styles.teamPhoto} />
      )}

      {teamData.teamName && (
        <Text style={styles.teamName}>
          {teamData.icon && (
            <Image source={{ uri: teamData.icon }} style={styles.icon} />
          )}{' '}
          {teamData.teamName}
        </Text>
      )}

      {teamData.headCoach && <Text>Head Coach: {teamData.headCoach}</Text>}
      {teamData.assistantCoach && <Text>Assistant Coach: {teamData.assistantCoach}</Text>}
      {teamData.teamManager && <Text>Manager: {teamData.teamManager}</Text>}

      <Text style={styles.subheading}>Players:</Text>

      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={renderPlayer}
        nestedScrollEnabled
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default Team;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  teamPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 8,
  },
  subheading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  playerName: {
    fontSize: 16,
  },
});
