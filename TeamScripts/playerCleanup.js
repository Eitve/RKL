const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, doc, setDoc } = require("firebase/firestore");

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

// Allowed fields to retain in player documents
const ALLOWED_FIELDS = [
  "dob",
  "age",
  "firstName",
  "height",
  "lastName",
  "nationality",
  "photoURL",
  "shirtNumber",
  "weight",
];

async function runCleanup() {
  try {
    // Fetch all teams
    const teamsCollectionRef = collection(db, "teams");
    const teamsSnapshot = await getDocs(teamsCollectionRef);

    for (const teamDoc of teamsSnapshot.docs) {
      const teamId = teamDoc.id;
      console.log(`Processing team: ${teamId}`);

      // Reference the players subcollection
      const playersCollectionRef = collection(db, `teams/${teamId}/players`);
      const playersSnapshot = await getDocs(playersCollectionRef);

      for (const playerDoc of playersSnapshot.docs) {
        const playerId = playerDoc.id;
        const playerData = playerDoc.data();

        // Keep only allowed fields
        const cleanedData = {};
        for (const field of ALLOWED_FIELDS) {
          if (playerData[field] !== undefined) {
            cleanedData[field] = playerData[field];
          }
        }

        // Update the player document with the cleaned data
        const playerRef = doc(playersCollectionRef, playerId);
        await setDoc(playerRef, cleanedData);
        console.log(`Cleaned up player '${playerId}' in team '${teamId}'.`);
      }
    }

    console.log("Cleanup complete!");
  } catch (error) {
    console.error("Error cleaning up documents:", error);
  }
}

// Run the cleanup script
runCleanup();
