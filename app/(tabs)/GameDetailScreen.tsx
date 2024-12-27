import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, ActivityIndicator, ScrollView, Image,} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import {doc, getDoc, collection, getDocs, query, where,} from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { ScheduleStackParamList } from './ScheduleStack';

function normalizeID(input: string): string {
  return input
    .toLowerCase()
    .replace(/ą/g, 'a')
    .replace(/č/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ė/g, 'e')
    .replace(/į/g, 'i')
    .replace(/š/g, 's')
    .replace(/ų/g, 'u')
    .replace(/ū/g, 'u')
    .replace(/ž/g, 'z')
    .replace(/\s+/g, '');
}

type GameDetailsRouteProp = RouteProp<ScheduleStackParamList, 'GameDetails'>;

interface GameDetail {
  gameID: number;
  homeTeam: string;  
  awayTeam: string;  
  finalPointsHome: number;
  finalPointsAway: number;
}

interface TeamDoc {
  teamID: string;
  teamName?: string;
  icon?: string;
}

interface BoxScorePlayer {
  name: string;     
  isStarter?: boolean;
  isCaptain?: boolean;
  Mins?: string;
  '2PA'?: number;
  '2PM'?: number;
  '3PA'?: number;
  '3PM'?: number;
  FTA?: number;
  FTM?: number;
  OFFREB?: number;
  DEFFREB?: number;
  AST?: number;
  STL?: number;
  BLK?: number;
  TOV?: number;
  PF?: number;
  PLUSMINUS?: number; 
  PTS?: number;
}

interface PlayerDoc {
  shirtNumber?: number;
  position?: string;
}

interface BoxScoreRow extends BoxScorePlayer {
  shirtNumber?: number;
  position?: string;
  FG?: number;      
  FGA?: number;     
  FGpct?: string;  
  twoPTpct?: string;
  threePTpct?: string;
  FTpct?: string;
  REB?: number;     
}

const STAT_COLUMNS = [
  { key: 'Mins',        label: 'Mins',     width: 50 },
  { key: 'PTS',         label: 'PTS',      width: 50 },
  { key: 'FG',          label: 'FG',       width: 50 },
  { key: 'FGA',         label: 'FGA',      width: 50 },
  { key: 'FGpct',       label: 'FG%',      width: 50 },
  { key: '2PM',         label: '2PM',      width: 50 },
  { key: '2PA',         label: '2PA',      width: 50 },
  { key: 'twoPTpct',    label: '2PT%',     width: 50 },
  { key: '3PM',         label: '3PM',      width: 50 },
  { key: '3PA',         label: '3PA',      width: 50 },
  { key: 'threePTpct',  label: '3PT%',     width: 50 },
  { key: 'FTM',         label: 'FTM',      width: 50 },
  { key: 'FTA',         label: 'FTA',      width: 50 },
  { key: 'FTpct',       label: 'FT%',      width: 50 },
  { key: 'REB',         label: 'REB',      width: 50 },
  { key: 'AST',         label: 'AST',      width: 50 },
  { key: 'STL',         label: 'STL',      width: 50 },
  { key: 'BLK',         label: 'BLK',      width: 50 },
  { key: 'TOV',         label: 'TOV',      width: 50 },
  { key: 'PF',          label: 'PF',       width: 50 },
  { key: 'PLUSMINUS',   label: '+/-',      width: 50 },
];

export default function GameDetailsScreen() {
  const route = useRoute<GameDetailsRouteProp>();
  const { gameID } = route.params;

  const [loading, setLoading] = useState(true);
  const [gameDetail, setGameDetail] = useState<GameDetail | null>(null);

  const [homeTeamDoc, setHomeTeamDoc] = useState<TeamDoc | null>(null);
  const [awayTeamDoc, setAwayTeamDoc] = useState<TeamDoc | null>(null);

  const [homeRows, setHomeRows] = useState<BoxScoreRow[]>([]);
  const [awayRows, setAwayRows] = useState<BoxScoreRow[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const gameRef = doc(firestore, 'games', String(gameID));
        const gameSnap = await getDoc(gameRef);
        if (!gameSnap.exists()) {
          console.warn(`Game ${gameID} not found.`);
          return;
        }
        const gameData = gameSnap.data() as GameDetail;
        setGameDetail(gameData);

        const teamsColl = collection(firestore, 'teams');
        const [homeQSnap, awayQSnap] = await Promise.all([
          getDocs(query(teamsColl, where('teamID', '==', gameData.homeTeam))),
          getDocs(query(teamsColl, where('teamID', '==', gameData.awayTeam))),
        ]);

        let homeTeamRef = null;
        let awayTeamRef = null;

        if (!homeQSnap.empty) {
          const ht = homeQSnap.docs[0];
          setHomeTeamDoc(ht.data() as TeamDoc);
          homeTeamRef = ht.ref;
        } else {
          console.warn(`No doc found for homeTeam = ${gameData.homeTeam}`);
        }
        if (!awayQSnap.empty) {
          const at = awayQSnap.docs[0];
          setAwayTeamDoc(at.data() as TeamDoc);
          awayTeamRef = at.ref;
        } else {
          console.warn(`No doc found for awayTeam = ${gameData.awayTeam}`);
        }

        const [boxHomeSnap, boxAwaySnap] = await Promise.all([
          getDocs(collection(gameRef, 'BoxScoreHome')),
          getDocs(collection(gameRef, 'BoxScoreAway')),
        ]);
        const homeBoxData = boxHomeSnap.docs.map((d) => ({
          name: d.id,
          ...d.data(),
        })) as BoxScorePlayer[];
        const awayBoxData = boxAwaySnap.docs.map((d) => ({
          name: d.id,
          ...d.data(),
        })) as BoxScorePlayer[];

        async function buildRows(
          teamRef: any,
          boxData: BoxScorePlayer[]
        ): Promise<BoxScoreRow[]> {
          if (!teamRef) {
            return boxData.map((b) => computeStats({ ...b }));
          }
          const playersColl = collection(teamRef, 'players');
          const rows: BoxScoreRow[] = [];

          for (const b of boxData) {
            const normName = normalizeID(b.name);
            const pSnap = await getDoc(doc(playersColl, normName));
            let pDoc: PlayerDoc = {};
            if (pSnap.exists()) pDoc = pSnap.data() as PlayerDoc;

            const row: BoxScoreRow = {
              ...b,
              shirtNumber: pDoc.shirtNumber,
              position: pDoc.position,
            };
            rows.push(computeStats(row));
          }
          return rows;
        }

        const builtHome = await buildRows(homeTeamRef, homeBoxData);
        const builtAway = await buildRows(awayTeamRef, awayBoxData);

        // Sort: starters first, by shirtNumber ascending
        function customSort(a: BoxScoreRow, b: BoxScoreRow) {
          const sA = a.isStarter ? 0 : 1;
          const sB = b.isStarter ? 0 : 1;
          if (sA !== sB) return sA - sB;
          const nA = a.shirtNumber ?? 9999;
          const nB = b.shirtNumber ?? 9999;
          return nA - nB;
        }
        builtHome.sort(customSort);
        builtAway.sort(customSort);

        setHomeRows(builtHome);
        setAwayRows(builtAway);

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [gameID]);

  function computeStats(row: BoxScoreRow): BoxScoreRow {
    const twoPM = row['2PM'] ?? 0;
    const twoPA = row['2PA'] ?? 0;
    const threePM = row['3PM'] ?? 0;
    const threePA = row['3PA'] ?? 0;
    const ftm = row.FTM ?? 0;
    const fta = row.FTA ?? 0;

    const FG = twoPM + threePM;
    const FGA = twoPA + threePA;

    let FGpct = '-';
    if (FGA > 0) FGpct = `${Math.round((FG / FGA) * 100)}%`;

    let twoPTpct = '-';
    if (twoPA > 0) twoPTpct = `${Math.round((twoPM / twoPA) * 100)}%`;

    let threePTpct = '-';
    if (threePA > 0) threePTpct = `${Math.round((threePM / threePA) * 100)}%`;

    let FTpct = '-';
    if (fta > 0) FTpct = `${Math.round((ftm / fta) * 100)}%`;

    const off = row.OFFREB ?? 0;
    const def = row.DEFFREB ?? 0;
    const REB = off + def;

    return {
      ...row,
      FG,
      FGA,
      FGpct,
      twoPTpct,
      threePTpct,
      FTpct,
      REB,
    };
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (!gameDetail) {
    return (
      <View style={styles.centered}>
        <Text>No details found for Game ID: {gameID}</Text>
      </View>
    );
  }

  function renderBoxScore(teamName: string, rows: BoxScoreRow[]) {
    if (rows.length === 0) {
      return (
        <View style={styles.boxScoreContainer}>
          <Text style={styles.tableTitle}>{teamName} Box Score</Text>
          <Text style={{ marginLeft: 16 }}>No box score data.</Text>
        </View>
      );
    }

    const firstBenchIndex = rows.findIndex((r) => !r.isStarter);

    return (
      <View style={styles.boxScoreContainer}>
        <Text style={styles.tableTitle}>{teamName} Box Score</Text>

        <ScrollView
          horizontal
          style={styles.tableWrapper}
          showsHorizontalScrollIndicator
        >
          <View>
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.headerCell, { width: 40 }]}>#</Text>
              <Text style={[styles.headerCell, { width: 120 }]}>Name</Text>
              <Text style={[styles.headerCell, { width: 60 }]}>Pos</Text>
              {STAT_COLUMNS.map((col) => (
                <Text
                  key={col.key}
                  style={[styles.headerCell, { width: col.width }]}
                >
                  {col.label}
                </Text>
              ))}
            </View>

            {rows.map((r, index) => {
              const isSeparator = index === firstBenchIndex && firstBenchIndex > 0;

              const displayName = r.isCaptain ? `${r.name} (C)` : r.name;

              return (
                <View
                  key={`${r.name}-${index}`}
                  style={[
                    styles.row,
                    isSeparator && styles.starterSeparator,
                  ]}
                >
                  <Text style={[styles.cell, { width: 40 }]}>
                    {r.shirtNumber ?? '-'}
                  </Text>

                  <Text
                    style={[styles.cell, { width: 120, flexWrap: 'wrap' }]}
                    numberOfLines={4}
                    ellipsizeMode="clip"
                  >
                    {displayName}
                  </Text>

                  <Text style={[styles.cell, { width: 60 }]}>
                    {r.position ?? '-'}
                  </Text>

                  {STAT_COLUMNS.map((col) => {
                    const val = (r as any)[col.key] ?? '-';
                    return (
                      <Text
                        key={col.key}
                        style={[styles.cell, { width: col.width }]}
                      >
                        {val}
                      </Text>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.scoreHeader}>
        <View style={styles.teamInfo}>
          {homeTeamDoc?.icon ? (
            <Image source={{ uri: homeTeamDoc.icon }} style={styles.teamIcon} />
          ) : (
            <View style={[styles.teamIcon, { backgroundColor: '#ccc' }]} />
          )}
          <Text style={styles.teamName}>
            {homeTeamDoc?.teamName ?? gameDetail.homeTeam}
          </Text>
        </View>

        <Text style={styles.scoreText}>{gameDetail.finalPointsHome}</Text>
        <Text style={styles.scoreDivider}> - </Text>
        <Text style={styles.scoreText}>{gameDetail.finalPointsAway}</Text>

        <View style={styles.teamInfo}>
          {awayTeamDoc?.icon ? (
            <Image source={{ uri: awayTeamDoc.icon }} style={styles.teamIcon} />
          ) : (
            <View style={[styles.teamIcon, { backgroundColor: '#ccc' }]} />
          )}
          <Text style={styles.teamName}>
            {awayTeamDoc?.teamName ?? gameDetail.awayTeam}
          </Text>
        </View>
      </View>

      {renderBoxScore(
        homeTeamDoc?.teamName ?? 'Home Team',
        homeRows
      )}

      {renderBoxScore(
        awayTeamDoc?.teamName ?? 'Away Team',
        awayRows
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 10,
    flexWrap: 'wrap',
  },
  teamInfo: {
    alignItems: 'center',
    maxWidth: 100,
  },
  teamIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 4,
  },
  teamName: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreDivider: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },

  boxScoreContainer: {
    marginBottom: 20,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
    marginBottom: 6,
  },
  tableWrapper: {
    marginHorizontal: 10,
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#fff',
  },

  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerRow: {
    backgroundColor: '#eee',
    borderBottomWidth: 2,
    borderBottomColor: '#999',
  },
  starterSeparator: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },

  headerCell: {
    textAlign: 'center',
    fontWeight: 'bold',
    paddingVertical: 6,
    paddingHorizontal: 2,
    fontSize: 12,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
  cell: {
    textAlign: 'left',
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontSize: 12,
    color: '#333',
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
});
