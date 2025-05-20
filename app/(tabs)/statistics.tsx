import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { firestore } from '../firebaseConfig';
import {
  collection,
  getDocs,
  doc,
  QuerySnapshot,
  updateDoc,
} from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatisticsStackParamList } from './_layout';
import { LeaderItem } from '../../components/LeaderItem';

/* ─────────────────── Types ─────────────────── */

type PositionFilter = 'ALL' | 'PG' | 'SG' | 'SF' | 'PF' | 'C';
type StatFilter =
  | 'PTS' | 'REB' | 'AST' | 'STL' | 'BLK'
  | 'FG%' | '2PT%' | '3PT%' | 'FT%' | 'EFF';

type PlayerAggregatedStats = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  photoURL: string;
  teamName: string;
  twoPM: number;  twoPA: number;
  threePM: number; threePA: number;
  FTM: number;   FTA: number;
  offReb: number; defReb: number;
  ast: number;   stl: number; blk: number;
  tov: number;   pf: number;  plusMinus: number;
  pts: number;   secs: number; eff: number;
  gamesPlayed: number;
};

type StatisticsNavigationProp = NativeStackNavigationProp<
  StatisticsStackParamList,
  'StatisticsMain'
>;

/* ───────────────── Helper ───────────────── */

const getStatValueFactory = (filter: StatFilter) => (p: PlayerAggregatedStats) => {
  const gp = p.gamesPlayed || 1;
  switch (filter) {
    case 'PTS':   return p.pts / gp;
    case 'REB':   return (p.offReb + p.defReb) / gp;
    case 'AST':   return p.ast / gp;
    case 'STL':   return p.stl / gp;
    case 'BLK':   return p.blk / gp;
    case 'FG%': {
      const made = p.twoPM + p.threePM;
      const att  = p.twoPA + p.threePA;
      return att ? (made / att) * 100 : 0;
    }
    case '2PT%':  return p.twoPA   ? (p.twoPM   / p.twoPA)   * 100 : 0;
    case '3PT%':  return p.threePA ? (p.threePM / p.threePA) * 100 : 0;
    case 'FT%':   return p.FTA     ? (p.FTM     / p.FTA)     * 100 : 0;
    case 'EFF':   return p.eff / gp;
    default:      return 0;
  }
};

const getRankText =
  (getStat: (p: PlayerAggregatedStats) => number) =>
  (index: number, arr: PlayerAggregatedStats[]) =>
{
  const cur = getStat(arr[index]);
  const prev = index > 0 ? getStat(arr[index - 1]) : null;
  return prev !== null && cur === prev ? `T-${index + 1}.` : `${index + 1}.`;
};

/* ───────────────── Component ───────────────── */

const StatisticsScreen: React.FC = () => {
  const navigation = useNavigation<StatisticsNavigationProp>();

  const [playersMap, setPlayersMap] = useState<Record<string, PlayerAggregatedStats>>({});
  const [loading, setLoading]       = useState(true);
  const [positionFilter, setPositionFilter] = useState<PositionFilter>('ALL');
  const [statFilter, setStatFilter]         = useState<StatFilter>('PTS');

  /* ──────────────── Fetch / Aggregate ──────────────── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        /* 1. Build empty aggregator */
        const teamsSnap = await getDocs(collection(firestore, 'teams'));
        const agg: Record<string, PlayerAggregatedStats> = {};

        for (const tDoc of teamsSnap.docs) {
          const teamName = (tDoc.data().teamName as string) || 'Unknown Team';
          const pSnap = await getDocs(collection(tDoc.ref, 'players'));

          pSnap.forEach((pDoc) => {
            const p = pDoc.data();
            const key = `${tDoc.id}-${pDoc.id}`;
            agg[key] = {
              id: key,
              firstName: p.firstName ?? 'N/A',
              lastName:  p.lastName  ?? 'N/A',
              position:  p.position  ?? '',
              photoURL:  p.photoURL  ?? '',
              teamName,
              twoPM: 0, twoPA: 0, threePM: 0, threePA: 0,
              FTM: 0,  FTA: 0,
              offReb: 0, defReb: 0,
              ast: 0, stl: 0, blk: 0,
              tov: 0, pf: 0, plusMinus: 0,
              pts: 0, secs: 0, eff: 0,
              gamesPlayed: 0,
            };
          });
        }

        /* 2. Sum box-scores */
        const gSnap = await getDocs(collection(firestore, 'games'));
        for (const gDoc of gSnap.docs) {
          const gRef = doc(firestore, 'games', gDoc.id);
          for (const side of ['BoxScoreHome', 'BoxScoreAway'] as const) {
            const boxSnap = await getDocs(collection(gRef, side));
            boxSnap.forEach((bx) => {
              const b = bx.data() as any;
              if (!b.name) return;

              const key = Object.keys(agg).find((k) =>
                `${agg[k].firstName} ${agg[k].lastName}`.toLowerCase().trim() ===
                b.name.trim().toLowerCase()
              );
              if (!key) return;

              const a = agg[key];
              a.twoPM += b['2PM'] || 0;
              a.twoPA += b['2PA'] || 0;
              a.threePM += b['3PM'] || 0;
              a.threePA += b['3PA'] || 0;
              a.FTM  += b.FTM  || 0;   a.FTA  += b.FTA  || 0;
              a.offReb += b.OFFREB || 0; a.defReb += b.DEFFREB || 0;
              a.ast += b.AST || 0;  a.stl += b.STL || 0;  a.blk += b.BLK || 0;
              a.tov += b.TOV || 0;  a.pf  += b.PF  || 0;
              a.plusMinus += b.PLUSMINUS || 0;
              a.pts += b.PTS || 0; a.eff += b.EFF || 0; a.secs += b.secs || 0;
              a.gamesPlayed += 1;
            });
          }
        }

        setPlayersMap({ ...agg });
        /* 3. (Optional) push per-player averages back to Firestore … */
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ──────────────── Derived data ──────────────── */

  const getStatValue = React.useMemo(() => getStatValueFactory(statFilter), [statFilter]);
  const leaders = React.useMemo(() => {
    let list = Object.values(playersMap);
    if (positionFilter !== 'ALL') {
      list = list.filter((p) => p.position.toUpperCase().includes(positionFilter));
    }
    return list.sort((a, b) => getStatValue(b) - getStatValue(a));
  }, [playersMap, positionFilter, getStatValue]);

  const rankLabel = React.useMemo(() => getRankText(getStatValue), [getStatValue]);

  /* ──────────────── Render ──────────────── */

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading stats…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stats Leaders</Text>

      {/* Filters */}
      <View style={styles.filterRow}>
        {(['ALL', 'PG', 'SG', 'SF', 'PF', 'C'] as const).map((pos) => (
          <TouchableOpacity
            key={pos}
            style={[
              styles.filterBtn,
              positionFilter === pos && styles.filterBtnActive,
            ]}
            onPress={() => setPositionFilter(pos)}
          >
            <Text style={styles.filterTxt}>{pos}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filterRow}>
        {(['PTS','REB','AST','STL','BLK','FG%','2PT%','3PT%','FT%','EFF'] as const).map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.filterBtn,
              statFilter === s && styles.filterBtnActive,
            ]}
            onPress={() => setStatFilter(s)}
          >
            <Text style={styles.filterTxt}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Leader list */}
      <FlatList
        data={leaders}
        keyExtractor={(p) => p.id}
        renderItem={({ item, index }) => (
          <LeaderItem
            player={item}
            statFilter={statFilter}
            rankText={rankLabel(index, leaders)}
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

/* ───────────────── Styles ───────────────── */

const styles = StyleSheet.create({
  container:  { flex: 1, paddingTop: 30, paddingHorizontal: 10, backgroundColor: '#fff' },
  centered:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title:      { fontSize: 22, fontWeight: 'bold', alignSelf: 'center', marginBottom: 10 },

  filterRow:  { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 5 },
  filterBtn:  { backgroundColor: '#ccc', padding: 8, margin: 4, borderRadius: 4 },
  filterBtnActive: { backgroundColor: '#007bff' },
  filterTxt:  { color: '#000', fontWeight: 'bold' },
});

export default StatisticsScreen;
