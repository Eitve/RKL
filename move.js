const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc, collection } = require("firebase/firestore");


const firebaseConfig = {
  apiKey: "AIzaSyBAtiQi_lIDAgOZwmWugJ3mf5TVVICVhTU",
  authDomain: "rklmobile.firebaseapp.com",
  projectId: "rklmobile",
  storageBucket: "rklmobile.firebasestorage.app",
  messagingSenderId: "369767637513",
  appId: "1:369767637513:web:c47b6a5083ef86cac78ed8",
  measurementId: "G-MYCM8WXQ6T"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
  {
    firstName: "Kristupas",
    lastName: "Švedkauskas",
    dob: "2007-11-17",
    position: "SG",
    age: 17,
    nationality: "LTU",
    height: 190,
    weight: 70,
    shirtNumber: 13,
    photoURL: "https://path-to-default-image.png",
    stats: {
      g: 10,
      mpg: 6.7,
      ppg: 0.4,
      "2apg": 0.1,
      "2mpg": 0.2,
      "2pPercent": 20,
      "3apg": 0.2,
      "3mpg": 0,
      "3pPercent": 0,
      ftapg: 0,
      ftmpg: 0,
      ftPercent: 0,
      rpg: 0.5,
      apg: 0.8,
      stpg: 0.1,
      topg: 0.3,
      blkpg: 0,
      fpg: 0.7,
      tfpg: 0.1,
    },
  },
  {
    firstName: "Tomas",
    lastName: "Zelenskij",
    dob: "2005-07-10",
    position: "SG",
    age: 19,
    nationality: "LTU",
    height: 195,
    weight: 89,
    shirtNumber: 5,
    photoURL: "https://path-to-default-image.png",
    stats: {
      g: 6,
      mpg: 30.3,
      ppg: 16.8,
      "2apg": 13,
      "2mpg": 6.5,
      "2pPercent": 50,
      "3apg": 4.3,
      "3mpg": 0.7,
      "3pPercent": 15.4,
      ftapg: 3.5,
      ftmpg: 1.8,
      ftPercent: 52.4,
      rpg: 8.5,
      apg: 2.8,
      stpg: 1.3,
      topg: 1.7,
      blkpg: 0.3,
      fpg: 0.8,
      tfpg: 0,
    },
  },
  {
    firstName: "Mindaugas",
    lastName: "Reminas",
    dob: "1986-06-16",
    position: "SF",
    age: 38,
    nationality: "LTU",
    height: 187,
    weight: 88,
    shirtNumber: 10,
    photoURL: "https://path-to-default-image.png",
    stats: {
      g: 1,
      mpg: 16.4,
      ppg: 10,
      "2apg": 2,
      "2mpg": 2,
      "2pPercent": 100,
      "3apg": 3,
      "3mpg": 2,
      "3pPercent": 66.7,
      ftapg: 0,
      ftmpg: 0,
      ftPercent: 0,
      rpg: 2,
      apg: 0,
      stpg: 2,
      topg: 1,
      blkpg: 0,
      fpg: 3,
      tfpg: 1,
    },
  },
  {
    firstName: "Titas",
    lastName: "Vainoras",
    dob: "2006-08-19",
    position: "SF",
    age: 18,
    nationality: "LTU",
    height: 196,
    weight: 71,
    shirtNumber: 55,
    photoURL: "https://path-to-default-image.png",
    stats: {
      g: 11,
      mpg: 24.6,
      ppg: 13.3,
      "2apg": 5.2,
      "2mpg": 2.7,
      "2pPercent": 52.6,
      "3apg": 5.1,
      "3mpg": 2,
      "3pPercent": 39.3,
      ftapg: 2.3,
      ftmpg: 1.8,
      ftPercent: 80,
      rpg: 3.6,
      apg: 2.1,
      stpg: 1.6,
      topg: 2,
      blkpg: 0.2,
      fpg: 3.6,
      tfpg: 2.2,
    },
  },
  // Add the rest of the players based on your data...
];

async function uploadPlayers() {
  const teamRef = doc(db, "teams", "palangosSportoCentras");
  const playersCollectionRef = collection(teamRef, "players");

  try {
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
    console.error("Error uploading players:", error);
  }
}

uploadPlayers();