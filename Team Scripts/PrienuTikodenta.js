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
      firstName: "Simas",
      lastName: "Aleksynas",
      dob: "2008-10-09",
      position: "SG",
      age: 16,
      nationality: "LTU",
      height: 193,
      weight: 80,
      shirtNumber: null,
      photoURL: "https://images.statsengine.playbyplay.api.geniussports.com/d9f21513adb12958f1f7c033faccee05M1.png",
      stats: {
        g: 13,
        mpg: 29,
        ppg: 12.2,
        "2apg": 5,
        "2mpg": 3,
        "2pPercent": 60,
        "3apg": 3.9,
        "3mpg": 1.2,
        "3pPercent": 29.4,
        ftapg: 4,
        ftmpg: 2.8,
        ftPercent: 69.2,
        rpg: 5.5,
        apg: 1.4,
        stpg: 1.3,
        topg: 0.9,
        blkpg: 1,
        fpg: 1.5,
        tfpg: 3.3,
      },
    },
    {
      firstName: "Aurimas",
      lastName: "Andrulevičius",
      dob: "2004-04-02",
      position: "C/PF",
      age: 20,
      nationality: "LTU",
      height: 203,
      weight: 90,
      shirtNumber: null,
      photoURL: "https://images.statsengine.playbyplay.api.geniussports.com/c8a375df1dd1230ac9d1b13fbf124463T1.png",
      stats: {
        g: 5,
        mpg: 2,
        ppg: 0.6,
        "2apg": 0,
        "2mpg": 0,
        "2pPercent": 0,
        "3apg": 0.2,
        "3mpg": 0.2,
        "3pPercent": 100,
        ftapg: 0.4,
        ftmpg: 0.2,
        ftPercent: 50,
        rpg: 0.4,
        apg: 0.2,
        stpg: 0.2,
        topg: 0.2,
        blkpg: 0,
        fpg: 0.4,
        tfpg: 0,
      },
    },
    {
      firstName: "Ignas",
      lastName: "Dirda",
      dob: "2000-05-03",
      position: "SG",
      age: 24,
      nationality: "LTU",
      height: 189,
      weight: 84,
      shirtNumber: null,
      photoURL: "https://images.statsengine.playbyplay.api.geniussports.com/1ceebe575224d4fd46e0d17aa80a795eT1.png",
      stats: {
        g: 13,
        mpg: 29,
        ppg: 12.2,
        "2apg": 5,
        "2mpg": 3,
        "2pPercent": 60,
        "3apg": 3.9,
        "3mpg": 1.2,
        "3pPercent": 29.4,
        ftapg: 4,
        ftmpg: 2.8,
        ftPercent: 69.2,
        rpg: 5.5,
        apg: 1.4,
        stpg: 1.3,
        topg: 0.9,
        blkpg: 1,
        fpg: 1.5,
        tfpg: 3.3,
      },
    },
    {
      firstName: "Paulius",
      lastName: "Gvazdaitis",
      dob: "1989-10-18",
      position: "C/PF",
      age: 35,
      nationality: "LTU",
      height: 210,
      weight: 110,
      shirtNumber: null,
      photoURL: "https://images.statsengine.playbyplay.api.geniussports.com/cbceaae378bf6a4d013ce0ecbef325f1T1.png",
      stats: {
        g: 5,
        mpg: 15.5,
        ppg: 4.4,
        "2apg": 2.4,
        "2mpg": 0,
        "2pPercent": 42.9,
        "3apg": 0,
        "3mpg": 0,
        "3pPercent": 0,
        ftapg: 1.4,
        ftmpg: 0.6,
        ftPercent: 42.9,
        rpg: 4.2,
        apg: 0.6,
        stpg: 0.2,
        topg: 2.4,
        blkpg: 1.6,
        fpg: 1.6,
        tfpg: 0.8,
      },
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