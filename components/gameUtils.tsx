import { Timestamp } from 'firebase/firestore';

// Function to remove Lithuanian characters and make all lowercase
export function normalizeID(input: string): string {
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
  
  // Function to compute additional statistics for a box score row
  export function computePlayerStats(boxScoreRow: any): any {
    const twoPointMade = boxScoreRow['2PM'] ?? 0;
    const twoPointAttempted = boxScoreRow['2PA'] ?? 0;
    const threePointMade = boxScoreRow['3PM'] ?? 0;
    const threePointAttempted = boxScoreRow['3PA'] ?? 0;
    const freeThrowsMade = boxScoreRow.FTM ?? 0;
    const freeThrowsAttempted = boxScoreRow.FTA ?? 0;
  
    const totalFieldGoalsMade = twoPointMade + threePointMade; // Total field goals made
    const totalFieldGoalsAttempted = twoPointAttempted + threePointAttempted; // Total field goals attempted
  
    let fieldGoalPercentage = '-';
    if (totalFieldGoalsAttempted > 0)
      fieldGoalPercentage = `${Math.round((totalFieldGoalsMade / totalFieldGoalsAttempted) * 100)}%`; // Calculate FG%
  
    let twoPointPercentage = '-';
    if (twoPointAttempted > 0)
      twoPointPercentage = `${Math.round((twoPointMade / twoPointAttempted) * 100)}%`; // Calculate 2PT%
  
    let threePointPercentage = '-';
    if (threePointAttempted > 0)
      threePointPercentage = `${Math.round((threePointMade / threePointAttempted) * 100)}%`; // Calculate 3PT%
  
    let freeThrowPercentage = '-';
    if (freeThrowsAttempted > 0)
      freeThrowPercentage = `${Math.round((freeThrowsMade / freeThrowsAttempted) * 100)}%`; // Calculate FT%
  
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

// Function to format game dates
  export function formatGameDate(dateInput: Timestamp | string | Date): { dateObj: Date; dateStr: string } {
    let dateObj: Date;
   if (dateInput instanceof Timestamp) {
      dateObj = dateInput.toDate();
   } else if (typeof dateInput === 'string') {
     dateObj = new Date(dateInput);
   } else {
     dateObj = dateInput;
   }

  const datePart = dateObj.toLocaleDateString();
  const timePart = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return { dateObj, dateStr: `${datePart} ${timePart}` };
}

// Function to determine if a game belongs to the selected division
  export function isDivisionMatch(gameDivision: 'A' | 'B', isDivisionBSelected: boolean): boolean {
    return gameDivision === (isDivisionBSelected ? 'B' : 'A');
}
  