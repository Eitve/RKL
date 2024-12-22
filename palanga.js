const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc, collection, getDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBAtiQi_lIDAgOZwmWugJ3mf5TVVICVhTU",
  authDomain: "rklmobile.firebaseapp.com",
  projectId: "rklmobile",
  storageBucket: "rklmobile.firebasestorage.app",
  messagingSenderId: "369767637513",
  appId: "1:369767637513:web:c47b6a5083ef86cac78ed8",
  measurementId: "G-MYCM8WXQ6T",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Team and Players Data
const teamData = {
  teamID: "palangosSportoCentras",
  teamName: "Palangos Sporto Centras",
  assistantCoach: "Mindaugas Reminas",
  division: "B-A",
  headCoach: "Regimantas Juška",
  gamesPlayed: 0,
  icon: "https://images.statsengine.playbyplay.api.geniussports.com/20b65625d6c13",
  losses: 0,
  wins: 0,
  standingPoints: 0,
  ptsDifference: 0,
  ptsPlus: 0,
  ptsMinus: 0,
  teamManager: "Saulius Simė",
  teamPhoto: "",
  achievements: [], // Empty array for future strings
  nameChanges: [], // Empty array for future strings
};

const players = [
  {
    firstName: "Jonas",
    lastName: "Zabitis",
    dob: "2008-08-10",
    position: "SG",
    age: 15,
    nationality: "LTU",
    height: 190,
    weight: 73,
    shirtNumber: 91,
    photoURL: "https://path-to-default-image.png",
    stats: {
      g: 11,
      mpg: 12.8,
      ppg: 1.6,
      "2apg": 0.6,
      "2mpg": 0.2,
      "2pPercent": 33.3,
      "3apg": 0.4,
      "3mpg": 0.2,
      "3pPercent": 7.7,
      ftapg: 1.1,
      ftmpg: 0.6,
      ftPercent: 58.3,
      rpg: 1.2,
      apg: 1.2,
      stpg: 0.6,
      topg: 0.7,
      blkpg: 0.2,
      fpg: 2.2,
      tfpg: 0,
    },
  },
  // Add more players here if needed...
];

async function uploadTeamAndPlayers() {
  const teamRef = doc(db, "teams", teamData.teamID);

  try {
    // Check if the team already exists
    const teamSnapshot = await getDoc(teamRef);
    if (teamSnapshot.exists()) {
      console.error(`Team with ID ${teamData.teamID} already exists. Aborting creation to avoid overwriting.`);
      return;
    }

    // Upload new team data
    await setDoc(teamRef, teamData);
    console.log(`New team '${teamData.teamName}' created successfully!`);

    // Upload players for the team
    const playersCollectionRef = collection(teamRef, "players");
    for (const player of players) {
      const playerRef = doc(playersCollectionRef, player.firstName + player.lastName);
      await setDoc(playerRef, {
        firstName: player.firstName,
        lastName: player.lastName,
        dob: player.dob,
        position: player.position,
        age: player.age,
        nationality: player.nationality,
        height: player.height,
        weight: player.weight,
        shirtNumber: player.shirtNumber,
        photoURL: player.photoURL,
        ...player.stats, // Spread stats into the document
      });
      console.log(`Uploaded player: ${player.firstName} ${player.lastName}`);
    }
    console.log("All players uploaded successfully!");
  } catch (error) {
    console.error("Error uploading team and players:", error);
  }
}

uploadTeamAndPlayers();
