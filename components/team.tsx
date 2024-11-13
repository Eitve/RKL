import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet } from 'react-native';
import { firestore } from '../app/firebaseConfig';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import Player from './player';

interface Team {
  teamName: string;
  teamManager: string;
  achievements: string[];
  assistantCoach: string;
  headCoach: string;
  icon: string;
  teamPhoto: string;
  nameChanges: string[];
}

interface PlayerData {
  id: string;
  firstName: string;
  lastName: string;
  photoURL: string;
  age: number;
  dob: string;
  position: string;
  s2PAPG: number;
  s2PMPG: number;
  s2pPercent: number;
  s3PAPG: number;
  s3PMPG: number;
  s3pPercent: number;
  sAPG: number;
  sBLKPG: number;
  sEFF: number;
  sFOPG: number;
  sFTPercent: number;
  sFTAPG: number;
  sFTMPG: number;
  sGP: number;
  sMPG: number;
  sPFPG: number;
  sPPG: number;
  sRPG: number;
  sSTPG: number;
  sTOPG: number;
  shirtNumber: number;
  weight: number;
}

const Team: React.FC<{ teamName: string }> = ({ teamName }) => {
  const [teamData, setTeamData] = useState<Team | null>(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {

        const teamDocRef = doc(firestore, 'teams', teamName);
        const teamDoc = await getDoc(teamDocRef);

        if (teamDoc.exists()) {
          setTeamData(teamDoc.data() as Team);
        }

        const playersCollectionRef = collection(firestore, `teams/${teamName}/players`);
        const playersSnapshot = await getDocs(playersCollectionRef);

        const playersData = playersSnapshot.docs.map((doc) => ({
          ...(doc.data() as PlayerData),
          id: doc.id,
        }));

        setPlayers(playersData);
      } catch (error) {
        console.error("Error fetching team data:", error);
      }
    };

    fetchTeamData();
  }, [teamName]);

  if (!teamData) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: teamData.teamPhoto }} style={styles.teamPhoto} />
      <Text style={styles.teamName}><Image source={{ uri: teamData.icon }} style={styles.icon} /> {teamData.teamName}</Text>
      <Text>Head Coach: {teamData.headCoach}</Text>
      <Text>Assistant Coach: {teamData.assistantCoach}</Text>
      <Text>Manager: {teamData.teamManager}</Text>
      
      <Text style={styles.subheading}>Achievements:</Text>
      {teamData.achievements.map((achievement, index) => (
        <Text key={index} style={styles.achievement}>- {achievement}</Text>
      ))}
      
      <Text style={styles.subheading}>Name Changes:</Text>
      {teamData.nameChanges.map((nameChange, index) => (
        <Text key={index} style={styles.nameChange}>- {nameChange}</Text>
      ))}

      <Text style={styles.subheading}>Players:</Text>
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Player playerData={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  teamPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginBottom: 10,
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: -10,
  },
  subheading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  achievement: {
    fontSize: 16,
    marginLeft: 10,
  },
  nameChange: {
    fontSize: 16,
    marginLeft: 10,
  },
});

export default Team;
