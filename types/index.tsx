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
  
  export interface PlayerDoc {
    firstName?: string;
    lastName?: string;
    dob?: string;
    age?: number;
    nationality?: string;
    height?: number;
    weight?: number;
    photoURL?: string;
    shirtNumber?: number;
    position?: string;
    avgPTS?: number;
    avgREB?: number;
    avgAST?: number;
    avgSTL?: number;
    avgBLK?: number;
    avgSecs?: number;
    gamesPlayed?: number;
  }
  
  export interface GameStats {
    gameID: string;
    finalScore: string;
    opponentTeamName: string; 
    isWin: boolean;
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    minutes: string;
  }

  export interface NewsItem {
    id: string;
    title: string;
    content: string;
    imageURL: string;
    number: number;
  }
  