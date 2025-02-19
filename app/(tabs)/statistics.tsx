import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { firestore } from '../firebaseConfig';
import { collection, getDocs, doc, QuerySnapshot, DocumentData, updateDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatisticsStackParamList } from './_layout';
import { PlayerAggregatedStats, BoxScoreDoc, PositionFilter, StatFilter } from '../../types';
import FilterRow from '../../components/FilterRow';
import PlayerRow from '../../components/PlayerRow';

type StatisticsNavigationProp = NativeStackNavigationProp<
  StatisticsStackParamList,
  'StatisticsMain'
>;

const StatisticsScreen: React.FC = () => {
  const navigation = useNavigation<StatisticsNavigationProp>();

  const [playersMap, setPlayersMap] = useState<Record<string, PlayerAggregatedStats>>({});
  const [loading, setLoading] = useState(true);
  const [positionFilter, setPositionFilter] = useState<PositionFilter>('ALL');
  const [statFilter, setStatFilter] = useState<StatFilter>('PTS');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

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
              secs: 0,
              eff: 0,
              gamesPlayed: 0,
            };
          }
        }

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
                const fullName = `${agg.firstName} ${agg.lastName}`.toLowerCase().trim();
                if (fullName === lowerName) {
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
              agg.secs += bData.secs || 0;
              agg.gamesPlayed += 1;
            });
          };

          processBox(boxHomeSnap);
          processBox(boxAwaySnap);
        }

        setPlayersMap({ ...aggregator });

        // Update player stats in the database
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
              avgEFF: st.eff / gp,
              secs: st.secs,
              avgSecs: st.secs / gp,
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
        case 'PTS':
          return p.pts / gp;
        case 'REB':
          return (p.offReb + p.defReb) / gp;
        case 'AST':
          return p.ast / gp;
        case 'STL':
          return p.stl / gp;
        case 'BLK':
          return p.blk / gp;
        case 'FG%': {
          const made = p.twoPM + p.threePM;
          const att = p.twoPA + p.threePA;
          return att ? (made / att) * 100 : 0;
        }
        case '2PT%':
          return p.twoPA ? (p.twoPM / p.twoPA) * 100 : 0;
        case '3PT%':
          return p.threePA ? (p.threePM / p.threePA) * 100 : 0;
        case 'FT%':
          return p.FTA ? (p.FTM / p.FTA) * 100 : 0;
        case 'EFF':
          return p.eff / gp;
        default:
          return 0;
      }
    };

    playersArr.sort((a, b) => getStatValue(b) - getStatValue(a));
    return playersArr;
  };

  const leaders = getFilteredSortedPlayers();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading stats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stats Leaders</Text>

      <FilterRow
        options={['ALL', 'PG', 'SG', 'SF', 'PF', 'C']}
        selected={positionFilter}
        onSelect={(option) => setPositionFilter(option as PositionFilter)}
      />

      <FilterRow
        options={['PTS', 'REB', 'AST', 'STL', 'BLK', 'FG%', '2PT%', '3PT%', 'FT%', 'EFF']}
        selected={statFilter}
        onSelect={(option) => setStatFilter(option as StatFilter)}
      />

      <FlatList
        data={leaders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlayerRow
            player={item}
            statFilter={statFilter}
            onPress={() => {
              const [teamID, playerID] = item.id.split('-');
              navigation.navigate('PlayerScreen', { teamID, playerID });
            }}
          />
        )}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
};

export default StatisticsScreen;

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
});
