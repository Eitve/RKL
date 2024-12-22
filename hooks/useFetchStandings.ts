import { useState, useCallback, useEffect } from 'react';
import { firestore } from '../app/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export type TeamProps = {
  id: string;
  teamName: string;
  icon: string;
  division: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  ptsMinus: number;
  ptsPlus: number;
  ptsDifference: number;
  standingPoints: number;
};

export function useFetchStandings() {
  const [teams, setTeams] = useState<TeamProps[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const teamsCollection = collection(firestore, 'teams');
      const teamSnapshot = await getDocs(teamsCollection);
      const teamsList: TeamProps[] = teamSnapshot.docs.map((doc) => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          teamName: data.teamName || doc.id,
          icon: data.icon || '',
          division: typeof data.division === 'string' ? data.division.trim() : '',
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          ptsMinus: 0,
          ptsPlus: 0,
          ptsDifference: 0,
          standingPoints: 0,
        };
      });

      const gamesCollection = collection(firestore, 'games');
      const gameSnapshot = await getDocs(gamesCollection);
      const gamesList = gameSnapshot.docs.map((doc) => doc.data());

      const teamMap = new Map<string, TeamProps>();
      teamsList.forEach((team) => teamMap.set(team.id, team));

      gamesList.forEach((game: any) => {
        const home = teamMap.get(game.homeTeam);
        const away = teamMap.get(game.awayTeam);

        if (!home || !away) return;

        home.ptsPlus += game.finalPointsHome;
        home.ptsMinus += game.finalPointsAway;
        away.ptsPlus += game.finalPointsAway;
        away.ptsMinus += game.finalPointsHome;

        const winnerTeam = teamMap.get(game.winner);
        const loserTeam = teamMap.get(game.loser);

        if (winnerTeam) winnerTeam.wins += 1;
        if (loserTeam) loserTeam.losses += 1;
      });

      teamsList.forEach((team) => {
        team.gamesPlayed = team.wins + team.losses;
        team.ptsDifference = team.ptsPlus - team.ptsMinus;
      });

      setTeams(teamsList);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { teams, loading };
}
