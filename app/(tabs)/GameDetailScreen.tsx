import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { ScheduleStackParamList } from './_layout';

// Importing Components
import LoadingIndicator from '@/components/LoadingIndicator';
import NoDetailsFound from '@/components/NoDetailsFound';
import ScoreHeader from '@/components/ScoreHeader';
import BoxScoreTable from '@/components/BoxScoreTable';

// Importing Styles
import styles from '../Styles/GameDetailScreenStyles';

// Importing Utility Functions
import { computePlayerStats, normalizeID } from '@/components/gameUtils'; // Corrected import path

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

// BoxScoreRowData for BoxScoreTable component
interface BoxScoreRowData {
  shirtNumber?: number;
  name: string;
  isCaptain?: boolean;
  isStarter?: boolean;
  position?: string;
  stats: { [key: string]: any };
}

export default function GameDetailsScreen() {
  // Access route parameters to get the gameID
  const route = useRoute<GameDetailsRouteProp>();
  const { gameID } = route.params;

  // State variables for loading status, game details, team documents, and box score rows
  const [isLoading, setIsLoading] = useState(true);
  const [gameDetails, setGameDetails] = useState<GameDetail | null>(null);

  const [homeTeamDocument, setHomeTeamDocument] = useState<TeamDoc | null>(null);
  const [awayTeamDocument, setAwayTeamDocument] = useState<TeamDoc | null>(null);

  const [homeBoxScoreRows, setHomeBoxScoreRows] = useState<BoxScoreRowData[]>([]);
  const [awayBoxScoreRows, setAwayBoxScoreRows] = useState<BoxScoreRowData[]>([]);

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
          setGameDetails(null);
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
        ): Promise<BoxScoreRowData[]> {
          if (!teamDocumentRef) {
            // If team reference is not available, compute stats without additional data
            return boxScoreData.map((player) => ({
              name: player.name,
              isCaptain: player.isCaptain,
              isStarter: player.isStarter,
              stats: computePlayerStats({ ...player }),
            }));
          }

          const playersCollectionRef = collection(teamDocumentRef, 'players'); // Reference to players subcollection
          const boxScoreRows: BoxScoreRowData[] = [];

          // Iterate through each player in boxScoreData
          for (const boxScorePlayer of boxScoreData) {
            const normalizedPlayerName = normalizeID(boxScorePlayer.name); // Normalize player name
            const playerDocumentSnapshot = await getDoc(doc(playersCollectionRef, normalizedPlayerName)); // Fetch player document
            let playerDetails: PlayerDoc = {};
            if (playerDocumentSnapshot.exists()) playerDetails = playerDocumentSnapshot.data() as PlayerDoc;

            // Combine box score data with player document data
            const stats = computePlayerStats({
              ...boxScorePlayer,
              shirtNumber: playerDetails.shirtNumber,
              position: playerDetails.position,
            });

            boxScoreRows.push({
              name: boxScorePlayer.name,
              isCaptain: boxScorePlayer.isCaptain,
              isStarter: boxScorePlayer.isStarter,
              position: playerDetails.position,
              shirtNumber: playerDetails.shirtNumber,
              stats,
            });
          }
          return boxScoreRows;
        }

        // Build box score rows for home and away teams
        const [processedHomeBoxScoreRows, processedAwayBoxScoreRows] = await Promise.all([
          buildBoxScoreRows(homeTeamDocumentRef, homeBoxScoreData),
          buildBoxScoreRows(awayTeamDocumentRef, awayBoxScoreData),
        ]);

        // Custom sort function: starters first, then by shirt number ascending
        function sortBoxScoreRows(a: BoxScoreRowData, b: BoxScoreRowData): number {
          const aStarter = a.isStarter ? 0 : 1;
          const bStarter = b.isStarter ? 0 : 1;
          if (aStarter !== bStarter) return aStarter - bStarter; // Sort starters before non-starters
          const aShirt = a.shirtNumber ?? 9999; // Default shirt number if not available
          const bShirt = b.shirtNumber ?? 9999;
          return aShirt - bShirt; // Sort by shirt number
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

  // Main render return
  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (!gameDetails) {
    return <NoDetailsFound gameID={gameID} />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Score Header */}
      <ScoreHeader
        homeTeam={{
          teamName: homeTeamDocument?.teamName ?? gameDetails.homeTeam,
          teamIcon: homeTeamDocument?.icon,
        }}
        awayTeam={{
          teamName: awayTeamDocument?.teamName ?? gameDetails.awayTeam,
          teamIcon: awayTeamDocument?.icon,
        }}
        finalPointsHome={gameDetails.finalPointsHome}
        finalPointsAway={gameDetails.finalPointsAway}
      />

      {/* Box Score for Home Team */}
      <BoxScoreTable
        teamName={homeTeamDocument?.teamName ?? 'Home Team'}
        boxScoreRows={homeBoxScoreRows}
      />

      {/* Box Score for Away Team */}
      <BoxScoreTable
        teamName={awayTeamDocument?.teamName ?? 'Away Team'}
        boxScoreRows={awayBoxScoreRows}
      />
    </ScrollView>
  );
}