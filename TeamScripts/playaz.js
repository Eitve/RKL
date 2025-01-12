const { initializeApp } = require("firebase/app");
const { getFirestore, collection, doc, setDoc } = require("firebase/firestore");

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAtiQi_lIDAgOZwmWugJ3mf5TVVICVhTU",
  authDomain: "rklmobile.firebaseapp.com",
  projectId: "rklmobile",
  storageBucket: "rklmobile.firebasestorage.app",
  messagingSenderId: "369767637513",
  appId: "1:369767637513:web:c47b6a5083ef86cac78ed8",
  measurementId: "G-MYCM8WXQ6T",
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const teamId = 'bcDruskininkai';
const players = [];

async function uploadPlayers() {
  try {
    // Reference to the 'players' collection under the specific team
    const teamPlayersRef = collection(db, `teams/${teamId}/players`);

    for (const player of players) {
      const playerDocRef = doc(teamPlayersRef, `${player.firstName} ${player.lastName}`);
      await setDoc(playerDocRef, player);
      console.log(`Uploaded player: ${player.firstName} ${player.lastName}`);
    }

    console.log('All players uploaded successfully!');
  } catch (error) {
    console.error('Error uploading players:', error);
  }
}

uploadPlayers();