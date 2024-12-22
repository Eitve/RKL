const axios = require("axios");
const { JSDOM } = require("jsdom");
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

const teamURL = "https://www.rkl.lt/609/komandos/kedainiu-sporto-centras/";

async function fetchTeamData(url) {
  try {
    const response = await axios.get(url);
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    const rows = document.querySelectorAll("tbody tr");
    const players = [];

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      const nameCell = cells[0];
      const nameLink = nameCell.querySelector("a");
      const img = nameCell.querySelector("img");

      players.push({
        firstName: nameLink ? nameLink.textContent.split(" ")[0] : "",
        lastName: nameLink ? nameLink.textContent.split(" ")[1] : "",
        dob: cells[2]?.getAttribute("data-value") || "",
        position: cells[3]?.textContent.trim() || "",
        age: parseInt(cells[4]?.textContent.trim() || "0", 10),
        nationality: cells[5]?.textContent.trim() || "",
        height: parseInt(cells[6]?.textContent.trim() || "0", 10),
        weight: parseInt(cells[7]?.textContent.trim() || "0", 10),
        shirtNumber: parseInt(cells[1]?.textContent.trim() || "0", 10),
        photoURL: img ? img.src : "",
        stats: {
          g: null,
          mpg: null,
          ppg: null,
          "2apg": null,
          "2mpg": null,
          "2pPercent": null,
          "3apg": null,
          "3mpg": null,
          "3pPercent": null,
          ftapg: null,
          ftmpg: null,
          ftPercent: null,
          rpg: null,
          apg: null,
          stpg: null,
          topg: null,
          blkpg: null,
          fpg: null,
          tfpg: null,
        },
      });
    });

    const teamData = {
      achievements: [],
      nameChanges: [],
      assistantCoach: "",
      division: "A",
      gamesPlayed: 0,
      headCoach: "",
      icon: "",
      losses: 0,
      ptsDifference: 0,
      ptsMinus: 0,
      ptsPlus: 0,
      standingPoints: 0,
      teamID: "kedainiu-sporto-centras",
      teamManager: "",
      teamName: "Kėdainių Sporto Centras",
      teamPhoto: "",
      wins: 0,
    };

    await uploadTeamAndPlayers(teamData, players);
  } catch (error) {
    console.error("Error fetching or parsing team data:", error);
  }
}

async function uploadTeamAndPlayers(teamData, players) {
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

fetchTeamData(teamURL);
