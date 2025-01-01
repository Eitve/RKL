const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs } = require("firebase/firestore");

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

/**
 * Rename a team document in Firestore
 * @param {string} oldTeamID - The current ID of the team document
 * @param {string} newTeamID - The new ID for the team document
 */
async function renameTeamDocument(oldTeamID, newTeamID) {
  const oldTeamRef = doc(db, "teams", oldTeamID);
  const newTeamRef = doc(db, "teams", newTeamID);
  const oldPlayersCollectionRef = collection(oldTeamRef, "players");
  const newPlayersCollectionRef = collection(newTeamRef, "players");

  try {
    // Get the existing team document
    const teamSnapshot = await getDoc(oldTeamRef);
    if (!teamSnapshot.exists()) {
      console.error(`Team with ID "${oldTeamID}" does not exist.`);
      return;
    }

    // Check if the new team ID already exists
    const newTeamSnapshot = await getDoc(newTeamRef);
    if (newTeamSnapshot.exists()) {
      console.error(`Team with ID "${newTeamID}" already exists. Aborting to avoid overwriting.`);
      return;
    }

    // Copy team data to the new document
    const teamData = teamSnapshot.data();
    await setDoc(newTeamRef, teamData);
    console.log(`Team document renamed to "${newTeamID}" successfully.`);

    // Copy players to the new team's players subcollection
    const playersSnapshot = await getDocs(oldPlayersCollectionRef);
    for (const playerDoc of playersSnapshot.docs) {
      const playerData = playerDoc.data();
      const newPlayerRef = doc(newPlayersCollectionRef, playerDoc.id);
      await setDoc(newPlayerRef, playerData);
      console.log(`Player "${playerDoc.id}" copied to new team.`);
    }

    // Delete the old team document
    await deleteDoc(oldTeamRef);
    console.log(`Old team document with ID "${oldTeamID}" deleted successfully.`);
  } catch (error) {
    console.error("Error renaming team document:", error);
  }
}

// Example usage
renameTeamDocument("BC Radviliškis", "bcRadviliskis");
