import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Image,} from 'react-native';
import { firestore } from '../firebaseConfig';
import { collection, getDocs, doc, QuerySnapshot, DocumentData,} from 'firebase/firestore';

type PlayerDoc = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  photoURL?: string;
};

type PlayerAggregatedStats = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  photoURL: string;
  teamName: string;

  twoPM: number;
  twoPA: number;
  threePM: number;
  threePA: number;
  FTM: number;
  FTA: number;
  offReb: number;
  defReb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  pf: number;
  plusMinus: number;
  pts: number;
  mins: number;      
  eff: number;

  gamesPlayed: number;
};

type BoxScoreDoc = {
  name: string;       // "Jonas Valančiūnas"
  '2PM'?: number;
  '2PA'?: number;
  '3PM'?: number;
  '3PA'?: number;
  FTM?: number;
  FTA?: number;
  OFFREB?: number;
  DEFFREB?: number;
  AST?: number;
  STL?: number;
  BLK?: number;
  TOV?: number;
  PF?: number;
  PLUSMINUS?: number;
  PTS?: number;
  MINS?: number;    
  EFF?: number;
};

const StatsLeadersScreen: React.FC = () => {
  const [playersMap, setPlayersMap] = useState<Record<string, PlayerAggregatedStats>>({});
  const [loading, setLoading] = useState(true);

  const [positionFilter, setPositionFilter] = useState<'ALL' | 'PG' | 'SG' | 'SF' | 'PF' | 'C'>('ALL');
  const [statFilter, setStatFilter] = useState<
    'PTS' | 'REB' | 'AST' | 'STL' | 'BLK' | 'FG%' | '2PT%' | '3PT%' | 'FT%' | 'EFF'
  >('PTS');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const teamsSnap = await getDocs(collection(firestore, 'teams'));
        let tempPlayersMap: Record<string, PlayerAggregatedStats> = {};

        for (const teamDoc of teamsSnap.docs) {
          const teamData = teamDoc.data() || {};
          const teamName = (teamData.teamName as string) || 'Unknown Team';

          const playersSnap = await getDocs(collection(teamDoc.ref, 'players'));
          for (const pDoc of playersSnap.docs) {
            const pData = pDoc.data() as DocumentData;
            const uniqueID = `${teamDoc.id}-${pDoc.id}`;

            const firstName = (pData.firstName as string) || 'N/A';
            const lastName = (pData.lastName as string) || 'N/A';
            const position = (pData.position as string) || '';
            const photoURL = (pData.photoURL as string) || '';

            tempPlayersMap[uniqueID] = {
              id: uniqueID,
              firstName,
              lastName,
              position,
              photoURL,
              teamName,

              twoPM: 0,
              twoPA: 0,
              threePM: 0,
              threePA: 0,
              FTM: 0,
              FTA: 0,
              offReb: 0,
              defReb: 0,
              ast: 0,
              stl: 0,
              blk: 0,
              tov: 0,
              pf: 0,
              plusMinus: 0,
              pts: 0,
              mins: 0,
              eff: 0,

              gamesPlayed: 0,
            };
          }
        }

        const gamesSnap = await getDocs(collection(firestore, 'games'));

        for (const gameDoc of gamesSnap.docs) {
          const gameRef = doc(firestore, 'games', gameDoc.id);

          // Read BoxScoreHome & BoxScoreAway
          const boxHomeSnap = await getDocs(collection(gameRef, 'BoxScoreHome'));
          const boxAwaySnap = await getDocs(collection(gameRef, 'BoxScoreAway'));

          const processBox = (boxSnap: QuerySnapshot) => {
            boxSnap.forEach((playerBoxDoc) => {
              const bData = playerBoxDoc.data() as BoxScoreDoc;
              if (!bData.name) return;

              // Match by name
              const boxName = bData.name.trim().toLowerCase();
              let matchedID: string | null = null;

              for (const [key, pStats] of Object.entries(tempPlayersMap)) {
                const fullName = `${pStats.firstName} ${pStats.lastName}`.trim().toLowerCase();
                if (fullName === boxName) {
                  matchedID = key;
                  break;
                }
              }
              if (!matchedID) return;

              const agg = tempPlayersMap[matchedID];
              agg.twoPM += bData['2PM'] || 0;
              agg.twoPA += bData['2PA'] || 0;
              agg.threePM += bData['3PM'] || 0;
              agg.threePA += bData['3PA'] || 0;
              agg.FTM += bData.FTM || 0;
              agg.FTA += bData.FTA || 0;
              agg.offReb += bData.OFFREB || 0;
              agg.defReb += bData.DEFFREB || 0;
              agg.ast += bData.AST || 0;
              agg.stl += bData.STL || 0;
              agg.blk += bData.BLK || 0;
              agg.tov += bData.TOV || 0;
              agg.pf += bData.PF || 0;
              agg.plusMinus += bData.PLUSMINUS || 0;
              agg.pts += bData.PTS || 0;
              agg.mins += bData.MINS || 0;
              agg.eff += bData.EFF || 0; // if present

              agg.gamesPlayed += 1;
            });
          };

          processBox(boxHomeSnap);
          processBox(boxAwaySnap);
        }

        setPlayersMap(tempPlayersMap);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /** Filter by position, then sort by selected stat descending. */
  const getFilteredSortedPlayers = () => {
    let playersArr = Object.values(playersMap);

    // 1) Filter by position if not ALL
    if (positionFilter !== 'ALL') {
      playersArr = playersArr.filter((p) =>
        p.position.toUpperCase().includes(positionFilter)
      );
    }

    // 2) Sort by the chosen stat
    // We define a helper to get the numeric value for the selected stat
    const getStatValue = (p: PlayerAggregatedStats): number => {
      const gp = p.gamesPlayed || 1;
      switch (statFilter) {
        case 'PTS':
          return p.pts / gp;  // points per game
        case 'REB':
          return (p.offReb + p.defReb) / gp; // rebounds per game
        case 'AST':
          return p.ast / gp;
        case 'STL':
          return p.stl / gp;
        case 'BLK':
          return p.blk / gp;
        case 'FG%': {
          const totalMade = p.twoPM + p.threePM;
          const totalAtt = p.twoPA + p.threePA;
          if (totalAtt === 0) return 0;
          return (totalMade / totalAtt) * 100;
        }
        case '2PT%': {
          if (p.twoPA === 0) return 0;
          return (p.twoPM / p.twoPA) * 100;
        }
        case '3PT%': {
          if (p.threePA === 0) return 0;
          return (p.threePM / p.threePA) * 100;
        }
        case 'FT%': {
          if (p.FTA === 0) return 0;
          return (p.FTM / p.FTA) * 100;
        }
        case 'EFF':
          return p.eff / gp;
        default:
          return 0;
      }
    };

    playersArr.sort((a, b) => getStatValue(b) - getStatValue(a));
    return playersArr;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading stats...</Text>
      </View>
    );
  }

  const leaders = getFilteredSortedPlayers();

  const renderLeader = ({ item }: { item: PlayerAggregatedStats }) => {
    const gp = item.gamesPlayed || 1;

    const statValue = (() => {
      switch (statFilter) {
        case 'PTS': return (item.pts / gp);
        case 'REB': return ((item.offReb + item.defReb) / gp);
        case 'AST': return (item.ast / gp);
        case 'STL': return (item.stl / gp);
        case 'BLK': return (item.blk / gp);
        case 'FG%': {
          const made = item.twoPM + item.threePM;
          const att = item.twoPA + item.threePA;
          return att ? ((made / att) * 100) : 0;
        }
        case '2PT%': {
          return item.twoPA ? ((item.twoPM / item.twoPA) * 100) : 0;
        }
        case '3PT%': {
          return item.threePA ? ((item.threePM / item.threePA) * 100) : 0;
        }
        case 'FT%': {
          return item.FTA ? ((item.FTM / item.FTA) * 100) : 0;
        }
        case 'EFF':
          return item.eff / gp;
        default:
          return 0;
      }
    })();

    const statDisplay = statFilter.includes('%')
      ? `${statValue.toFixed(1)}%`
      : statValue.toFixed(1);

    return (
      <View style={styles.playerRow}>
        {item.photoURL ? (
          <Image
            source={{ uri: item.photoURL }}
            style={styles.playerImage}
          />
        ) : (
          <View style={[styles.playerImage, { backgroundColor: '#ccc' }]} />
        )}

        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={styles.playerName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.teamName}>{item.teamName}</Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.statValue}>
            {statFilter}: {statDisplay}
          </Text>
        </View>
      </View>
    );
  };

  const handlePositionPress = (pos: typeof positionFilter) => {
    setPositionFilter(pos);
  };
  const handleStatPress = (stat: typeof statFilter) => {
    setStatFilter(stat);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stats Leaders</Text>

      <View style={styles.filterRow}>
        {(['ALL', 'PG', 'SG', 'SF', 'PF', 'C'] as const).map((pos) => (
          <TouchableOpacity
            key={pos}
            style={[
              styles.filterButton,
              positionFilter === pos && styles.filterButtonSelected,
            ]}
            onPress={() => handlePositionPress(pos)}
          >
            <Text style={styles.filterButtonText}>{pos}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stat filter row */}
      <View style={styles.filterRow}>
        {(['PTS', 'REB', 'AST', 'STL', 'BLK', 'FG%', '2PT%', '3PT%', 'FT%', 'EFF'] as const).map(
          (stat) => (
            <TouchableOpacity
              key={stat}
              style={[
                styles.filterButton,
                statFilter === stat && styles.filterButtonSelected,
              ]}
              onPress={() => handleStatPress(stat)}
            >
              <Text style={styles.filterButtonText}>{stat}</Text>
            </TouchableOpacity>
          )
        )}
      </View>

      <FlatList
        data={leaders}
        keyExtractor={(item) => item.id}
        renderItem={renderLeader}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
};

export default StatsLeadersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
    paddingHorizontal: 10,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 10,
  },
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
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    marginVertical: 6,
    padding: 10,
    borderRadius: 6,
  },
  playerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  playerName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  teamName: {
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});