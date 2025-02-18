export type GameProps = {
    gameID: number;
    homeTeam: string;
    awayTeam: string;
    finalPointsHome: number | null;
    finalPointsAway: number | null;
    division: 'A' | 'B';
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
    name: string;
    icon: string;
  };
  