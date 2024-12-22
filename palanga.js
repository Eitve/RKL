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


const teamData = {
  achievements: [
    "2015-2016: RKL A divizione pasiekė 1/8 finalo etapą;",
    "2016-2017: RKL A divizione pasiekė 1/8 finalo etapą;",
    "2017-2018: RKL A divizione užėmė 14-ąją vietą;",
    "2019-2020: RKL A divizione užėmė 16-ąją vietą;",
    "2020-2021: RKL A divizione užėmė 14-ąją vietą;",
    "2021-2022: RKL A divizione užėmė 13-ąją vietą."
  ],
  nameChanges: [
    "2019-2020: Lietuvos sporto universitetas (RKL A divizionas);",
    "2020-2021: Kauno „LSU-Atletas“ (RKL A divizionas);",
    "2022-2023: Lietuvos sporto universitetas (LSU) (RKL B divizionas);"
  ],
  assistantCoach: "Kęstutis Kemzūra",
  division: "B-B", // As per instruction
  gamesPlayed: 0,
  headCoach: "Ramūnas Butautas",
  icon: "https://images.statsengine.playbyplay.api.geniussports.com/2e34f6aec38ac61aaa38632e0319fb40S1.png", // Placeholder left empty as requested
  losses: 0,
  ptsDifference: 0,
  ptsMinus: 0,
  ptsPlus: 0,
  standingPoints: 0,
  teamID: "lietuvosSportoUniversitetas", // Unique identifier
  teamManager: "Deimantas Valavičius",
  teamName: "Lietuvos sporto universitetas",
  teamPhoto: "https://images.statsengine.playbyplay.api.geniussports.com/2e34f6aec38ac61aaa38632e0319fb40S1.png", // Placeholder left empty as requested
  wins: 0
};





const players = [
  {
    firstName: "Filler",
    lastName: "Player",
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
