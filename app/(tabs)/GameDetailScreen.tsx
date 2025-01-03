import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { ScheduleStackParamList } from './_layout';

// Function to remove Lithuanian characters and make all lowercase
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
    .replace(/\s+/g, ''); // Removes spaces
}

// Defining route type for navigation
type GameDetailsRouteProp = RouteProp<ScheduleStackParamList, 'GameDetails'>;

// Overall game details (i.e., teams, points, game ID)
interface GameDetail {
  gameID: number;
  homeTeam: string;  
  awayTeam: string;  
  finalPointsHome: number;
  finalPointsAway: number;
}

// Interface representing team document structure
interface TeamDoc {
  teamID: string;
  teamName?: string;
  icon?: string;
}

// Each player has statistics; here is what goes into the box score for EACH player
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

// Getting position and shirt number from the player within a team document in the database to save time inputting number/position
// This doesn't even work yet :/
// I shouldn't even do this, since, at least in lower competition, you don't play 100% of your games with the same number, gotta look into it
interface PlayerDoc {
  shirtNumber?: number;
  position?: string;
}

// Extended interface for box score rows including computed statistics
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

// Constant defining the columns to display in the box score table
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

// Main component for displaying game details and box scores
export default function GameDetailsScreen() {
  // Access route parameters to get the gameID
  const route = useRoute<GameDetailsRouteProp>();
  const { gameID } = route.params;

  // State variables for loading status, game details, team documents, and box score rows
  const [isLoading, setIsLoading] = useState(true);
  const [gameDetails, setGameDetails] = useState<GameDetail | null>(null);

  const [homeTeamDocument, setHomeTeamDocument] = useState<TeamDoc | null>(null);
  const [awayTeamDocument, setAwayTeamDocument] = useState<TeamDoc | null>(null);

  const [homeBoxScoreRows, setHomeBoxScoreRows] = useState<BoxScoreRow[]>([]);
  const [awayBoxScoreRows, setAwayBoxScoreRows] = useState<BoxScoreRow[]>([]);

  // useEffect hook to fetch data when the component mounts or gameID changes
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setIsLoading(true); // Start loading

        // Reference to the specific game document in Firestore
        const gameDocumentRef = doc(firestore, 'games', String(gameID));
        const gameDocumentSnapshot = await getDoc(gameDocumentRef); // Fetch game document

        if (!gameDocumentSnapshot.exists()) {
          console.warn(`Game ${gameID} not found.`);
          return; // Exit if game not found
        }

        const fetchedGameDetails = gameDocumentSnapshot.data() as GameDetail;
        setGameDetails(fetchedGameDetails); // Set game details state

        const teamsCollectionRef = collection(firestore, 'teams'); // Reference to teams collection

        // Fetch home and away team documents concurrently
        const [homeTeamQuerySnapshot, awayTeamQuerySnapshot] = await Promise.all([
          getDocs(query(teamsCollectionRef, where('teamID', '==', fetchedGameDetails.homeTeam))),
          getDocs(query(teamsCollectionRef, where('teamID', '==', fetchedGameDetails.awayTeam))),
        ]);

        let homeTeamDocumentRef: any = null;
        let awayTeamDocumentRef: any = null;

        // Process home team document
        if (!homeTeamQuerySnapshot.empty) {
          const homeTeamDocSnapshot = homeTeamQuerySnapshot.docs[0];
          setHomeTeamDocument(homeTeamDocSnapshot.data() as TeamDoc);
          homeTeamDocumentRef = homeTeamDocSnapshot.ref;
        } else {
          console.warn(`No document found for homeTeam = ${fetchedGameDetails.homeTeam}`);
        }

        // Process away team document
        if (!awayTeamQuerySnapshot.empty) {
          const awayTeamDocSnapshot = awayTeamQuerySnapshot.docs[0];
          setAwayTeamDocument(awayTeamDocSnapshot.data() as TeamDoc);
          awayTeamDocumentRef = awayTeamDocSnapshot.ref;
        } else {
          console.warn(`No document found for awayTeam = ${fetchedGameDetails.awayTeam}`);
        }

        // Fetch box score data for home and away teams concurrently
        const [homeBoxScoreSnapshot, awayBoxScoreSnapshot] = await Promise.all([
          getDocs(collection(gameDocumentRef, 'BoxScoreHome')),
          getDocs(collection(gameDocumentRef, 'BoxScoreAway')),
        ]);

        // Map box score data to BoxScorePlayer array for home team
        const homeBoxScoreData = homeBoxScoreSnapshot.docs.map((docSnapshot) => ({
          name: docSnapshot.id,
          ...docSnapshot.data(),
        })) as BoxScorePlayer[];

        // Map box score data to BoxScorePlayer array for away team
        const awayBoxScoreData = awayBoxScoreSnapshot.docs.map((docSnapshot) => ({
          name: docSnapshot.id,
          ...docSnapshot.data(),
        })) as BoxScorePlayer[];

        // Function to build box score rows by fetching additional player details
        async function buildBoxScoreRows(
          teamDocumentRef: any,
          boxScoreData: BoxScorePlayer[]
        ): Promise<BoxScoreRow[]> {
          if (!teamDocumentRef) {
            // If team reference is not available, compute stats without additional data
            return boxScoreData.map((player) => computePlayerStats({ ...player }));
          }

          const playersCollectionRef = collection(teamDocumentRef, 'players'); // Reference to players subcollection
          const boxScoreRows: BoxScoreRow[] = [];

          // Iterate through each player in boxScoreData
          for (const boxScorePlayer of boxScoreData) {
            const normalizedPlayerName = normalizeID(boxScorePlayer.name); // Normalize player name
            const playerDocumentSnapshot = await getDoc(doc(playersCollectionRef, normalizedPlayerName)); // Fetch player document
            let playerDetails: PlayerDoc = {};
            if (playerDocumentSnapshot.exists()) playerDetails = playerDocumentSnapshot.data() as PlayerDoc;

            // Combine box score data with player document data
            const boxScoreRow: BoxScoreRow = {
              ...boxScorePlayer,
              shirtNumber: playerDetails.shirtNumber,
              position: playerDetails.position,
            };
            boxScoreRows.push(computePlayerStats(boxScoreRow)); // Compute additional stats and add to rows
          }
          return boxScoreRows;
        }

        // Build box score rows for home and away teams
        const processedHomeBoxScoreRows = await buildBoxScoreRows(homeTeamDocumentRef, homeBoxScoreData);
        const processedAwayBoxScoreRows = await buildBoxScoreRows(awayTeamDocumentRef, awayBoxScoreData);

        // Custom sort function: starters first, then by shirt number ascending
        function sortBoxScoreRows(firstPlayer: BoxScoreRow, secondPlayer: BoxScoreRow) {
          const firstPlayerStarter = firstPlayer.isStarter ? 0 : 1;
          const secondPlayerStarter = secondPlayer.isStarter ? 0 : 1;
          if (firstPlayerStarter !== secondPlayerStarter) return firstPlayerStarter - secondPlayerStarter; // Sort starters before non-starters
          const firstPlayerShirtNumber = firstPlayer.shirtNumber ?? 9999; // Default shirt number if not available
          const secondPlayerShirtNumber = secondPlayer.shirtNumber ?? 9999;
          return firstPlayerShirtNumber - secondPlayerShirtNumber; // Sort by shirt number
        }

        processedHomeBoxScoreRows.sort(sortBoxScoreRows); // Sort home team rows
        processedAwayBoxScoreRows.sort(sortBoxScoreRows); // Sort away team rows

        setHomeBoxScoreRows(processedHomeBoxScoreRows); // Set home team box score rows
        setAwayBoxScoreRows(processedAwayBoxScoreRows); // Set away team box score rows

      } catch (error) {
        console.error('Error fetching data:', error); // Log any errors
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    fetchGameData(); // Invoke the data fetching function
  }, [gameID]); // Dependency array ensures fetchGameData runs when gameID changes

  // Function to compute additional statistics for a box score row
  function computePlayerStats(boxScoreRow: BoxScoreRow): BoxScoreRow {
    const twoPointMade = boxScoreRow['2PM'] ?? 0;
    const twoPointAttempted = boxScoreRow['2PA'] ?? 0;
    const threePointMade = boxScoreRow['3PM'] ?? 0;
    const threePointAttempted = boxScoreRow['3PA'] ?? 0;
    const freeThrowsMade = boxScoreRow.FTM ?? 0;
    const freeThrowsAttempted = boxScoreRow.FTA ?? 0;

    const totalFieldGoalsMade = twoPointMade + threePointMade; // Total field goals made
    const totalFieldGoalsAttempted = twoPointAttempted + threePointAttempted; // Total field goals attempted

    let fieldGoalPercentage = '-';
    if (totalFieldGoalsAttempted > 0) fieldGoalPercentage = `${Math.round((totalFieldGoalsMade / totalFieldGoalsAttempted) * 100)}%`; // Calculate FG%

    let twoPointPercentage = '-';
    if (twoPointAttempted > 0) twoPointPercentage = `${Math.round((twoPointMade / twoPointAttempted) * 100)}%`; // Calculate 2PT%

    let threePointPercentage = '-';
    if (threePointAttempted > 0) threePointPercentage = `${Math.round((threePointMade / threePointAttempted) * 100)}%`; // Calculate 3PT%

    let freeThrowPercentage = '-';
    if (freeThrowsAttempted > 0) freeThrowPercentage = `${Math.round((freeThrowsMade / freeThrowsAttempted) * 100)}%`; // Calculate FT%

    const offensiveRebounds = boxScoreRow.OFFREB ?? 0;
    const defensiveRebounds = boxScoreRow.DEFFREB ?? 0;
    const totalRebounds = offensiveRebounds + defensiveRebounds; // Total rebounds

    return {
      ...boxScoreRow,
      FG: totalFieldGoalsMade,
      FGA: totalFieldGoalsAttempted,
      FGpct: fieldGoalPercentage,
      twoPTpct: twoPointPercentage,
      threePTpct: threePointPercentage,
      FTpct: freeThrowPercentage,
      REB: totalRebounds,
    };
  }

  // Render loading indicator while data is being fetched
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Render message if game details are not found
  if (!gameDetails) {
    return (
      <View style={styles.centered}>
        <Text>No details found for Game ID: {gameID}</Text>
      </View>
    );
  }

  // Function to render the box score table for a team
  function renderBoxScore(teamName: string, boxScoreRows: BoxScoreRow[]) {
    if (boxScoreRows.length === 0) {
      // If no box score data is available
      return (
        <View style={styles.boxScoreContainer}>
          <Text style={styles.tableTitle}>{teamName} Box Score</Text>
          <Text style={{ marginLeft: 16 }}>No box score data.</Text>
        </View>
      );
    }

    // Find the index where bench players start to insert a separator
    const firstBenchPlayerIndex = boxScoreRows.findIndex((player) => !player.isStarter);

    return (
      <View style={styles.boxScoreContainer}>
        <Text style={styles.tableTitle}>{teamName} Box Score</Text>

        <ScrollView
          horizontal
          style={styles.tableWrapper}
          showsHorizontalScrollIndicator
        >
          <View>
            {/* Header row for the box score table */}
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.headerCell, { width: 40 }]}>#</Text>
              <Text style={[styles.headerCell, { width: 120 }]}>Name</Text>
              <Text style={[styles.headerCell, { width: 60 }]}>Pos</Text>
              {STAT_COLUMNS.map((statColumn) => (
                <Text
                  key={statColumn.key}
                  style={[styles.headerCell, { width: statColumn.width }]}
                >
                  {statColumn.label}
                </Text>
              ))}
            </View>

            {/* Render each player's statistics */}
            {boxScoreRows.map((playerRow, index) => {
              const isSeparator = index === firstBenchPlayerIndex && firstBenchPlayerIndex > 0;

              // Display captain designation if applicable
              const displayPlayerName = playerRow.isCaptain ? `${playerRow.name} (C)` : playerRow.name;

              return (
                <View
                  key={`${playerRow.name}-${index}`}
                  style={[
                    styles.row,
                    isSeparator && styles.starterSeparator, // Add separator if it's the first bench player
                  ]}
                >
                  {/* Shirt number */}
                  <Text style={[styles.cell, { width: 40 }]}>
                    {playerRow.shirtNumber ?? '-'}
                  </Text>

                  {/* Player name with potential line wrapping */}
                  <Text
                    style={[styles.cell, { width: 120, flexWrap: 'wrap' }]}
                    numberOfLines={4}
                    ellipsizeMode="clip"
                  >
                    {displayPlayerName}
                  </Text>

                  {/* Player position */}
                  <Text style={[styles.cell, { width: 60 }]}>
                    {playerRow.position ?? '-'}
                  </Text>

                  {/* Render each statistical column */}
                  {STAT_COLUMNS.map((statColumn) => {
                    const statValue = (playerRow as any)[statColumn.key] ?? '-';
                    return (
                      <Text
                        key={statColumn.key}
                        style={[styles.cell, { width: statColumn.width }]}
                      >
                        {statValue}
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

  // Main render return
  return (
    <ScrollView style={styles.container}>
      {/* Header displaying team icons, names, and final scores */}
      <View style={styles.scoreHeader}>
        {/* Home team information */}
        <View style={styles.teamInfo}>
          {homeTeamDocument?.icon ? (
            <Image source={{ uri: homeTeamDocument.icon }} style={styles.teamIcon} />
          ) : (
            <View style={[styles.teamIcon, { backgroundColor: '#ccc' }]} />
          )}
          <Text style={styles.teamName}>
            {homeTeamDocument?.teamName ?? gameDetails.homeTeam}
          </Text>
        </View>

        {/* Final points for home and away teams */}
        <Text style={styles.scoreText}>{gameDetails.finalPointsHome}</Text>
        <Text style={styles.scoreDivider}> - </Text>
        <Text style={styles.scoreText}>{gameDetails.finalPointsAway}</Text>

        {/* Away team information */}
        <View style={styles.teamInfo}>
          {awayTeamDocument?.icon ? (
            <Image source={{ uri: awayTeamDocument.icon }} style={styles.teamIcon} />
          ) : (
            <View style={[styles.teamIcon, { backgroundColor: '#ccc' }]} />
          )}
          <Text style={styles.teamName}>
            {awayTeamDocument?.teamName ?? gameDetails.awayTeam}
          </Text>
        </View>
      </View>

      {/* Render box score for home team */}
      {renderBoxScore(
        homeTeamDocument?.teamName ?? 'Home Team',
        homeBoxScoreRows
      )}

      {/* Render box score for away team */}
      {renderBoxScore(
        awayTeamDocument?.teamName ?? 'Away Team',
        awayBoxScoreRows
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
