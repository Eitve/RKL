import React from 'react';
import {
  TouchableOpacity,
  Image,
  View,
  Text,
  StyleSheet,
} from 'react-native';

/* ──────────────────── Types ──────────────────── */

type StatFilter =
  | 'PTS' | 'REB' | 'AST' | 'STL' | 'BLK'
  | 'FG%' | '2PT%' | '3PT%' | 'FT%' | 'EFF';

type PlayerAggregatedStats = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  photoURL: string;
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
  secs: number;
  eff: number;
  gamesPlayed: number;
};

type Props = {
  player: PlayerAggregatedStats;
  statFilter: StatFilter;
  rankText: string;
  onPress: () => void;
};

/* ───────────────── Helper ───────────────── */

const toMMSS = (totalSecs: number) => {
  const mm = Math.floor(totalSecs / 60);
  const ss = totalSecs % 60;
  return `${mm}:${ss < 10 ? `0${ss}` : ss}`;
};

/* ───────────────── Component ───────────────── */

export const LeaderItem: React.FC<Props> = ({
  player,
  statFilter,
  rankText,
  onPress,
}) => {
  const gp   = player.gamesPlayed || 1;
  const mmss = toMMSS(Math.round(player.secs / gp));

  /* Stat for current filter */
  const statValue = (() => {
    switch (statFilter) {
      case 'PTS':   return player.pts / gp;
      case 'REB':   return (player.offReb + player.defReb) / gp;
      case 'AST':   return player.ast / gp;
      case 'STL':   return player.stl / gp;
      case 'BLK':   return player.blk / gp;
      case 'FG%': {
        const made = player.twoPM + player.threePM;
        const att  = player.twoPA + player.threePA;
        return att ? (made / att) * 100 : 0;
      }
      case '2PT%':  return player.twoPA   ? (player.twoPM   / player.twoPA)   * 100 : 0;
      case '3PT%':  return player.threePA ? (player.threePM / player.threePA) * 100 : 0;
      case 'FT%':   return player.FTA     ? (player.FTM     / player.FTA)     * 100 : 0;
      case 'EFF':   return player.eff / gp;
      default:      return 0;
    }
  })();

  const statDisplay =
    statFilter.includes('%')
      ? `${statValue.toFixed(1)}%`
      : statValue.toFixed(1);

  /* ──────────────── UI ──────────────── */

  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      {/* Rank */}
      <View style={styles.rankBlock}>
        <Text style={styles.rank}>{rankText}</Text>
      </View>

      {/* Avatar / Placeholder */}
      {player.photoURL.trim() ? (
        <Image source={{ uri: player.photoURL }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitials}>
            {(player.firstName[0] || '').toUpperCase()}
            {(player.lastName[0]  || '').toUpperCase()}
          </Text>
        </View>
      )}

      {/* Name */}
      <View style={styles.nameBlock}>
        <Text style={styles.nameText}>
          {player.firstName} {player.lastName}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsLeft}>
          <View style={styles.pill}><Text style={styles.pillText}>GP: {gp}</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>MPG: {mmss}</Text></View>
        </View>

        <View style={styles.statsRight}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{statDisplay}/g</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

/* ───────────────── Styles ───────────────── */

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4E8D1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginVertical: 6,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },

  /* rank */
  rankBlock: { width: 32, justifyContent: 'center', marginRight: 6 },
  rank:      { fontSize: 16, fontWeight: '600', color: '#002109', fontFamily: 'Akshar' },

  /* avatar */
  avatar: {
    width: 40, height: 40, borderRadius: 6,
    backgroundColor: '#516351', marginRight: 8,
  },
  avatarPlaceholder: {
    width: 40, height: 40, borderRadius: 6,
    backgroundColor: '#516351',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
  },
  avatarInitials: {
    color: '#fff', fontWeight: '700', fontSize: 16,
  },

  /* name */
  nameBlock: { flex: 1, justifyContent: 'center' },
  nameText: {
    fontSize: 15, fontWeight: '700',
    color: '#002109', fontFamily: 'Akshar',
    textAlign: 'center',
  },

  /* stats */
  statsContainer: {
    flexDirection: 'row', alignItems: 'center', marginLeft: 10,
  },
  statsLeft:  { justifyContent: 'space-between', marginRight: 6 },
  statsRight: { justifyContent: 'center' },

  pill: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginVertical: 1,
    minWidth: 50,
    alignItems: 'center',
  },
  pillText: { fontSize: 11, fontWeight: '600', color: '#000' },
});
