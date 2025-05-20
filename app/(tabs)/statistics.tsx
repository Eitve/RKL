import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { firestore } from '../firebaseConfig';
import {
  collection,
  getDocs,
  doc,
} from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatisticsStackParamList } from './_layout';
import { LeaderItem } from '../../components/LeaderItem';

/* ─────────────────── Types ─────────────────── */

type PositionFilter = 'ALL' | 'PG' | 'SG' | 'SF' | 'PF' | 'C';
// NOTE: "PTS" is treated as Points‑Per‑Game (PPG) in the UI label
export type StatFilter =
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

/* ───────────────── Constants ───────────────── */

const POSITION_OPTIONS: PositionFilter[] = ['ALL', 'PG', 'SG', 'SF', 'PF', 'C'];
const STAT_OPTIONS: StatFilter[] = ['PTS','REB','AST','STL','BLK','FG%','2PT%','3PT%','FT%','EFF'];
// Division filter placeholder – extend when you have divisions in your data model
const DIV_OPTIONS: string[] = ['ALL'];

/* ───────────────── Helpers ───────────────── */



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
  (index: number, arr: PlayerAggregatedStats[]) => {
    const cur  = getStat(arr[index]);
    const prev = index > 0 ? getStat(arr[index - 1]) : null;
    // Tie detection → prepend "T-"
    return prev !== null && cur === prev ? `T-${index + 1}.` : `${index + 1}.`;
  };

/* ───────────────── UI sub‑components ───────────────── */

type PillProps = {
  label: string;   // e.g. "STAT"
  value: string;   // e.g. "PPG" / "ALL"
  onPress: () => void;
};

const FilterPill: React.FC<PillProps> = ({ label, value, onPress }) => (
  <TouchableOpacity style={pillStyles.pill} onPress={onPress} activeOpacity={0.7}>
    <Text style={pillStyles.label}>{label}: </Text>
    <Text style={pillStyles.value}>{value}</Text>
    <Feather name="chevron-down" size={16} color="#fff" style={{ marginLeft: 2 }} />
  </TouchableOpacity>
);

const pillStyles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#265C3A',   // dark green
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 9999,           // pill shape
    marginHorizontal: 4,
    elevation: 3,                 // Android shadow
    shadowColor: '#000',          // iOS shadow
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  label: { color: '#fff', fontWeight: '600', fontSize: 14 },
  value: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

/* ───────────────── Component ───────────────── */

const StatisticsScreen: React.FC = () => {
  const navigation = useNavigation<StatisticsNavigationProp>();

  // Core state
  const [playersMap,      setPlayersMap]      = useState<Record<string, PlayerAggregatedStats>>({});
  const [loading,         setLoading]         = useState(true);
  const [positionFilter,  setPositionFilter]  = useState<PositionFilter>('ALL');
  const [statFilter,      setStatFilter]      = useState<StatFilter>('PTS');
  const [divFilter,       setDivFilter]       = useState<string>('ALL');   // future use

  // Local UI state for modal visibility
  const [showPosSel,      setShowPosSel]      = useState(false);
  const [showStatSel,     setShowStatSel]     = useState(false);
  const [showDivSel,      setShowDivSel]      = useState(false);

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

        /* 2. Sum box‑scores */
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
              a.twoPM += b['2PM'] || 0; a.twoPA += b['2PA'] || 0;
              a.threePM += b['3PM'] || 0; a.threePA += b['3PA'] || 0;
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ──────────────── Derived data ──────────────── */

  const getStatValue = useMemo(() => getStatValueFactory(statFilter), [statFilter]);

  const leaders = useMemo(() => {
    let list = Object.values(playersMap);
    if (positionFilter !== 'ALL') {
      list = list.filter((p) => p.position.toUpperCase().includes(positionFilter));
    }
    // *When division filtering is implemented, add it here.*
    return list.sort((a, b) => getStatValue(b) - getStatValue(a));
  }, [playersMap, positionFilter, divFilter, getStatValue]);

  const rankLabel = useMemo(() => getRankText(getStatValue), [getStatValue]);

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

      {/* ─────────── PILL FILTERS ─────────── */}
      <View style={styles.pillRow}>
        <FilterPill
          label="STAT"
          value={statFilter === 'PTS' ? 'PPG' : statFilter}
          onPress={() => setShowStatSel(true)}
        />
        <FilterPill
          label="POS"
          value={positionFilter}
          onPress={() => setShowPosSel(true)}
        />
        <FilterPill
          label="DIV"
          value={divFilter}
          onPress={() => setShowDivSel(true)}
        />
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

      {/* ─────────── SELECTOR MODALS ─────────── */}
      {/* Re‑usable generic modal */}
      {showStatSel && (
        <OptionModal
          options={STAT_OPTIONS}
          getLabel={(v) => (v === 'PTS' ? 'PPG' : v)}
          onSelect={(v) => setStatFilter(v as StatFilter)}
          onRequestClose={() => setShowStatSel(false)}
        />
      )}

      {showPosSel && (
        <OptionModal
          options={POSITION_OPTIONS}
          onSelect={(v) => setPositionFilter(v as PositionFilter)}
          onRequestClose={() => setShowPosSel(false)}
        />
      )}

      {showDivSel && (
        <OptionModal
          options={DIV_OPTIONS}
          onSelect={(v) => setDivFilter(v)}
          onRequestClose={() => setShowDivSel(false)}
        />
      )}
    </View>
  );
};

/* ──────────────── Option Modal ──────────────── */

type OptionModalProps<T extends string> = {
  options: readonly T[] | T[];
  getLabel?: (v: T) => string;
  onSelect: (value: T) => void;
  onRequestClose: () => void;
};

function OptionModal<T extends string>({ options, getLabel, onSelect, onRequestClose }: OptionModalProps<T>) {
  return (
    <Modal transparent animationType="fade" onRequestClose={onRequestClose}>
      <Pressable style={modalStyles.backdrop} onPress={onRequestClose}>
        <View style={modalStyles.box}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={modalStyles.item}
              onPress={() => { onSelect(opt); onRequestClose(); }}
            >
              <Text style={modalStyles.itemText}>{getLabel ? getLabel(opt) : opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  backdrop:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  box:        { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 8, width: 260, elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 3 } },
  item:       { paddingVertical: 14, alignItems: 'center' },
  itemText:   { fontSize: 16, fontWeight: '600' },
});

/* ───────────────── Styles ───────────────── */

const styles = StyleSheet.create({
  container:  { flex: 1, paddingTop: 30, paddingHorizontal: 10, backgroundColor: '#fff' },
  centered:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title:      { fontSize: 22, fontWeight: 'bold', alignSelf: 'center', marginBottom: 10 },

  pillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
});

export default StatisticsScreen;
