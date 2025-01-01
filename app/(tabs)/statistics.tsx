import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { firestore } from '../firebaseConfig';
import {
  collection,
  getDocs,
  doc,
  QuerySnapshot,
  DocumentData,
  updateDoc,
} from 'firebase/firestore';

// Utility function to format seconds to MM:SS
function toMMSS(totalSecs: number): string {
  const mm = Math.floor(totalSecs / 60);
  const ss = totalSecs % 60;
  const mmStr = mm.toString();
  const ssStr = ss < 10 ? `0${ss}` : `${ss}`;
  return `${mmStr}:${ssStr}`;
}

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
  secs: number; // Total seconds played
  eff: number;
  gamesPlayed: number;
};

type BoxScoreDoc = {
  name: string;
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
  SECS?: number; // Seconds played in a game
  EFF?: number;
};

const StatsLeadersScreen = () => {
  const [playersMap, setPlayersMap] = useState<Record<string, PlayerAggregatedStats>>({});
  const [loading, setLoading] = useState(true);

  const [positionFilter, setPositionFilter] = useState<'ALL' | 'PG' | 'SG' | 'SF' | 'PF' | 'C'>('ALL');
  const [statFilter, setStatFilter] = useState<'PTS' | 'REB' | 'AST' | 'STL' | 'BLK' | 'FG%' | '2PT%' | '3PT%' | 'FT%' | 'EFF'>('PTS');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1) Gather Teams and initialize aggregator
        const teamsSnap = await getDocs(collection(firestore, 'teams'));
        const aggregator: Record<string, PlayerAggregatedStats> = {};

        for (const tDoc of teamsSnap.docs) {
          const tData = tDoc.data() || {};
          const teamName = (tData.teamName as string) || 'Unknown Team';
          const pSnap = await getDocs(collection(tDoc.ref, 'players'));

          for (const pDoc of pSnap.docs) {
            const pData = pDoc.data() as DocumentData;
            const uniqueID = `${tDoc.id}-${pDoc.id}`;

            aggregator[uniqueID] = {
              id: uniqueID,
              firstName: (pData.firstName as string) || 'N/A',
              lastName: (pData.lastName as string) || 'N/A',
              position: (pData.position as string) || '',
              photoURL: (pData.photoURL as string) || '',
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
              secs: 0, // Initialize total seconds to 0
              eff: 0,
              gamesPlayed: 0,
            };
          }
        }

        // 2) Gather all games and their boxscores
        const gSnap = await getDocs(collection(firestore, 'games'));
        for (const gDoc of gSnap.docs) {
          const gRef = doc(firestore, 'games', gDoc.id);
          const boxHomeSnap = await getDocs(collection(gRef, 'BoxScoreHome'));
          const boxAwaySnap = await getDocs(collection(gRef, 'BoxScoreAway'));

          const processBox = (boxSnap: QuerySnapshot) => {
            boxSnap.forEach((bx) => {
              const bData = bx.data() as BoxScoreDoc;
              if (!bData.name) return;

              const lowerName = bData.name.trim().toLowerCase();
              let matchedKey: string | null = null;

              for (const [k, agg] of Object.entries(aggregator)) {
                const fullN = (agg.firstName + ' ' + agg.lastName).toLowerCase().trim();
                if (fullN === lowerName) {
                  matchedKey = k;
                  break;
                }
              }
              if (!matchedKey) return;

              const agg = aggregator[matchedKey];

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
              agg.eff += bData.EFF || 0;

              agg.secs += bData.SECS || 0;

              agg.gamesPlayed += 1;
            });
          };

          processBox(boxHomeSnap);
          processBox(boxAwaySnap);
        }

        setPlayersMap({ ...aggregator });

        for (const [key, st] of Object.entries(aggregator)) {
          const [teamID, playerID] = key.split('-');
          if (!teamID || !playerID) continue;

          const gp = st.gamesPlayed || 1;
          const avgPTS = st.pts / gp;
          const avgREB = (st.offReb + st.defReb) / gp;
          const avgAST = st.ast / gp;
          const avgSTL = st.stl / gp;
          const avgBLK = st.blk / gp;
          const totalMade = st.twoPM + st.threePM;
          const totalAtt = st.twoPA + st.threePA;

          let fgPct = 0;
          if (totalAtt > 0) fgPct = (totalMade / totalAtt) * 100;

          let twoPtPct = 0;
          if (st.twoPA > 0) twoPtPct = (st.twoPM / st.twoPA) * 100;

          let threePtPct = 0;
          if (st.threePA > 0) threePtPct = (st.threePM / st.threePA) * 100;

          let ftPct = 0;
          if (st.FTA > 0) ftPct = (st.FTM / st.FTA) * 100;

          const avgEFF = st.eff / gp;

          const avgSecs = st.secs / gp;

          try {
            await updateDoc(doc(firestore, 'teams', teamID, 'players', playerID), {
              gamesPlayed: st.gamesPlayed,
              avgPTS,
              avgREB,
              avgAST,
              avgSTL,
              avgBLK,
              fgPct,
              twoPtPct,
              threePtPct,
              ftPct,
              avgEFF,
              secs: st.secs,
              avgSecs,
              avgTOV: st.tov / gp,
              avgPF: st.pf / gp,
              avgPlusMinus: st.plusMinus / gp,
              avgOFFREB: st.offReb / gp,
              avgDEFFREB: st.defReb / gp,
            });
          } catch (err) {
            console.error('Error updating doc:', key, err);
          }
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading stats...</Text>
      </View>
    );
  }

  const getFilteredSortedPlayers = () => {
    let playersArr = Object.values(playersMap);
    if (positionFilter !== 'ALL') {
      playersArr = playersArr.filter((p) =>
        p.position.toUpperCase().includes(positionFilter.toUpperCase())
      );
    }

    const getStatValue = (p: PlayerAggregatedStats): number => {
      const gp = p.gamesPlayed || 1;
      switch (statFilter) {
        case 'PTS': return p.pts / gp;
        case 'REB': return (p.offReb + p.defReb) / gp;
        case 'AST': return p.ast / gp;
        case 'STL': return p.stl / gp;
        case 'BLK': return p.blk / gp;
        case 'FG%': {
          const made = p.twoPM + p.threePM;
          const att = p.twoPA + p.threePA;
          return att ? (made / att) * 100 : 0;
        }
        case '2PT%': return p.twoPA ? (p.twoPM / p.twoPA) * 100 : 0;
        case '3PT%': return p.threePA ? (p.threePM / p.threePA) * 100 : 0;
        case 'FT%': return p.FTA ? (p.FTM / p.FTA) * 100 : 0;
        case 'EFF': return p.eff / gp;
        default: return 0;
      }
    };

    playersArr.sort((a, b) => getStatValue(b) - getStatValue(a));
    return playersArr;
  };

  const leaders = getFilteredSortedPlayers();

  const renderLeader = ({ item }: { item: PlayerAggregatedStats }) => {
    const gp = item.gamesPlayed || 1;
    const val = (() => {
      switch (statFilter) {
        case 'PTS': return item.pts / gp;
        case 'REB': return (item.offReb + item.defReb) / gp;
        case 'AST': return item.ast / gp;
        case 'STL': return item.stl / gp;
        case 'BLK': return item.blk / gp;
        case 'FG%': {
          const made = item.twoPM + item.threePM;
          const att = item.twoPA + item.threePA;
          return att ? (made / att) * 100 : 0;
        }
        case '2PT%': return item.twoPA ? (item.twoPM / item.twoPA) * 100 : 0;
        case '3PT%': return item.threePA ? (item.threePM / item.threePA) * 100 : 0;
        case 'FT%': return item.FTA ? (item.FTM / item.FTA) * 100 : 0;
        case 'EFF': return item.eff / gp;
        default: return 0;
      }
    })();
    const statDisplay = statFilter.includes('%')
      ? `${val.toFixed(1)}%`
      : val.toFixed(1);

    // Convert average secs to mm:ss
    const mmss = toMMSS(Math.round(item.secs / gp));

    return (
      <View style={styles.playerRow}>
        {item.photoURL ? (
          <Image source={{ uri: item.photoURL }} style={styles.playerImage} />
        ) : (
          <View style={[styles.playerImage, { backgroundColor: '#ccc' }]} />
        )}
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={styles.playerName}>
            {item.firstName} {item.lastName} (GP: {gp}, Mins/G: {mmss})
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

      <View style={styles.filterRow}>
        {(['PTS', 'REB', 'AST', 'STL', 'BLK', 'FG%', '2PT%', '3PT%', 'FT%', 'EFF'] as const).map(
          (s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.filterButton,
                statFilter === s && styles.filterButtonSelected,
              ]}
              onPress={() => handleStatPress(s)}
            >
              <Text style={styles.filterButtonText}>{s}</Text>
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
