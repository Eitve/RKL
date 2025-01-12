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
  achievements: [
    "2014-2015: RKL B divizione pasiekė 1/4 finalo etapą;",
    "2015-2016: RKL B divizione užėmė 3-ąją vietą;",
    "2016-2017: RKL B divizione užėmė 4-ąją vietą;",
    "2017-2018: RKL B divizione pasiekė 1/8 finalo etapą;",
    "2018-2019: RKL B divizione pasiekė 1/8 finalo etapą;",
    "2019-2020: RKL B divizione pasiekė 1/8 finalo etapą;",
    "2020-2021: RKL A divizione pasiekė 1/8 finalo etapą.",
    "2021-2022: RKL A divizione pasiekė 1/8 finalo etapą.",
  ],
  nameChanges: [
    "2014-2015: Stakliškių „Stakliškės“",
    "2015-2018: Stakliškių „Guosta“",
    "2018-2019: Prienų KKSC",
    "2019-2020: Prienų „CBet“-KKSC",
    "2021-2022: Prienų „Labas GAS“-KKSC",
    "2022-2023: Prienų ,,Mačiūnai-KKSC\"",
    "2023-2024 Prienų „Tikodenta",
  ],
  assistantCoach: "Livijus Ražaitis",
  division: "A",
  gamesPlayed: 0,
  headCoach: "Paulius Ivanauskas",
  icon: "https://images.statsengine.playbyplay.api.geniussports.com/88c024fecab2dd731e9ec73c11692703S1.png",
  losses: 0,
  ptsDifference: 0,
  ptsMinus: 0,
  ptsPlus: 0,
  standingPoints: 0,
  teamID: "prienuTikodenta", // This will be used to generate a unique document
  teamManager: "Rimutis Katukevičius",
  teamName: "Prienų Tikodenta",
  teamPhoto: "https://www.rkl.lt/wp-content/uploads/2024/09/prienu-maciunai-kksc-2500.jpg",
  wins: 0,
};

const players = [
    {
      firstName: '',
      lastName: '',
      photoURL: '',
      age: 0,
      dob: '',
      id: '',
      position: '',
      shirtNumber: '',
      teamName: '',
      

    },

  ];
  

  async function uploadTeamAndPlayers() {
    const teamRef = doc(db, "teams", teamData.teamID); // Use the teamID to create a unique document
    const playersCollectionRef = collection(teamRef, "players");
  
    try {
      // Check if the team already exists
      const teamSnapshot = await getDoc(teamRef);
      if (teamSnapshot.exists()) {
        console.error(`Team with ID "${teamData.teamID}" already exists. Aborting to avoid overwriting.`);
        return;
      }
  
      // Upload new team data
      await setDoc(teamRef, teamData);
      console.log(`New team '${teamData.teamName}' created successfully!`);
  
      // Upload players for the team
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