export type GameProps = {
    gameID: number;
    homeTeam: string;
    awayTeam: string;
    finalPointsHome: number;
    finalPointsAway: number;
    division: 'A' | 'B';
    winner?: string;
    loser?: string;
  };
  
  export type ScheduledGameProps = {
    homeTeam: string;
    awayTeam: string;
    division: 'A' | 'B';
    arena?: string;
    dateObj: Date;
    dateStr: string;
  };
  
  export type TeamProps = {
    id: string;
    teamName: string;
    icon: string;
    division?: string;
    gamesPlayed?: number;
    wins?: number;
    losses?: number;
    ptsMinus?: number;
    ptsPlus?: number;
    ptsDifference?: number;
    standingPoints?: number;
  };
  