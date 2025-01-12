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

const exampleData = {
  gameID: 1,
  division: "A",
  date: "October 11, 2024 at 6:00PM GMT",

  homeTeam: "vytautoDidziojoUniversitetas",
  awayTeam: "bcDruskininkai",

  loser: "vytautoDidziojoUniversitetas",
  winner: "bcDruskininkai",


  quarterOnePointsHome: 17,
  quarterOnePointsAway: 27,

  quarterTwoPointsHome: 16,
  quarterTwoPointsAway: 19,

  quarterThreePointsHome: 20,
  quarterThreePointsAway: 24,
  
  quarterFourPointsHome: 27,
  quarterFourPointsAway: 31,

  finalPointsHome: 80,
  finalPointsAway: 101,



  BoxScoreAway: {
    "Ričardas Butkus": {
        "id": "vytautoDidziojoUniversitetas-ricardasButkus",
        "PTS":       10,
        "Mins": "15:40",
        "2PM":       0,
        "2PA":       0,
        "3PM":       2,
        "3PA":       7,
        "FTM":       4,
        "FTA":       4,
        "OFFREB":    2,
        "DEFFREB":   0,
        "AST":       1,
        "TOV":       1,
        "STL":       2,
        "BLK":       0,
        "BLKR":      0,
        "PF":        1,
        "FRS":       4,
        "PLUSMINUS": -6,
        "EFF":       9,

      "secs": 2308,
      "isCaptain": false,
      "isStarter": true,

    },
    "": {
        "id": "vytautoDidziojoUniversitetas-",
        "PTS":       14,
        "Mins": "38:20",
        "2PM":       3,
        "2PA":       8,
        "3PM":       2,
        "3PA":       9,
        "FTM":       2,
        "FTA":       2,
        "OFFREB":    0,
        "DEFFREB":   2,
        "AST":       6,
        "TOV":       1,
        "STL":       0,
        "BLK":       0,
        "BLKR":      1,
        "PF":        1,
        "FRS":       3,
        "PLUSMINUS": 4,
        "EFF":       9,

      "secs": 2308,
      "isCaptain": false,
      "isStarter": true,

    },
    "": {
        "id": "vytautoDidziojoUniversitetas-",
        "PTS":       14,
        "Mins": "38:20",
        "2PM":       3,
        "2PA":       8,
        "3PM":       2,
        "3PA":       9,
        "FTM":       2,
        "FTA":       2,
        "OFFREB":    0,
        "DEFFREB":   2,
        "AST":       6,
        "TOV":       1,
        "STL":       0,
        "BLK":       0,
        "BLKR":      1,
        "PF":        1,
        "FRS":       3,
        "PLUSMINUS": 4,
        "EFF":       9,

      "secs": 2308,
      "isCaptain": false,
      "isStarter": true,

    },
    "": {
        "id": "vytautoDidziojoUniversitetas-",
        "PTS":       14,
        "Mins": "38:20",
        "2PM":       3,
        "2PA":       8,
        "3PM":       2,
        "3PA":       9,
        "FTM":       2,
        "FTA":       2,
        "OFFREB":    0,
        "DEFFREB":   2,
        "AST":       6,
        "TOV":       1,
        "STL":       0,
        "BLK":       0,
        "BLKR":      1,
        "PF":        1,
        "FRS":       3,
        "PLUSMINUS": 4,
        "EFF":       9,

      "secs": 2308,
      "isCaptain": false,
      "isStarter": true,

    },
    "": {
        "id": "vytautoDidziojoUniversitetas-",
        "PTS":       14,
        "Mins": "38:20",
        "2PM":       3,
        "2PA":       8,
        "3PM":       2,
        "3PA":       9,
        "FTM":       2,
        "FTA":       2,
        "OFFREB":    0,
        "DEFFREB":   2,
        "AST":       6,
        "TOV":       1,
        "STL":       0,
        "BLK":       0,
        "BLKR":      1,
        "PF":        1,
        "FRS":       3,
        "PLUSMINUS": 4,
        "EFF":       9,

      "secs": 2308,
      "isCaptain": false,
      "isStarter": true,

    },
    "": {
        "id": "vytautoDidziojoUniversitetas-",
        "PTS":       14,
        "Mins": "38:20",
        "2PM":       3,
        "2PA":       8,
        "3PM":       2,
        "3PA":       9,
        "FTM":       2,
        "FTA":       2,
        "OFFREB":    0,
        "DEFFREB":   2,
        "AST":       6,
        "TOV":       1,
        "STL":       0,
        "BLK":       0,
        "BLKR":      1,
        "PF":        1,
        "FRS":       3,
        "PLUSMINUS": 4,
        "EFF":       9,

      "secs": 2308,
      "isCaptain": false,
      "isStarter": true,

    },
    
  },
  BoxScoreHome: {
    "": {
        "id": "",
        "PTS":       14,
        "Mins": "38:20",
        "2PM":       3,
        "2PA":       8,
        "3PM":       2,
        "3PA":       9,
        "FTM":       2,
        "FTA":       2,
        "OFFREB":    0,
        "DEFFREB":   2,
        "AST":       6,
        "TOV":       1,
        "STL":       0,
        "BLK":       0,
        "BLKR":      1,
        "PF":        1,
        "FRS":       3,
        "PLUSMINUS": 4,
        "EFF":       9,

      "secs": 2308,
      "isCaptain": false,
      "isStarter": true,

    },
  },
};

const uploadGameData = async () => {
  try {
    const gameDocRef = db.collection("games").doc(String(exampleData.gameID));
    await gameDocRef.set({
      awayTeam: exampleData.awayTeam,
      date: exampleData.date,
      division: exampleData.division,
      finalPointsAway: exampleData.finalPointsAway,
      finalPointsHome: exampleData.finalPointsHome,
      homeTeam: exampleData.homeTeam,
      loser: exampleData.loser,
      overtimeOnePointsAway: exampleData.overtimeOnePointsAway,
      overtimeOnePointsHome: exampleData.overtimeOnePointsHome,
      quarterFourPointsAway: exampleData.quarterFourPointsAway,
      quarterFourPointsHome: exampleData.quarterFourPointsHome,
      quarterOnePointsAway: exampleData.quarterOnePointsAway,
      quarterOnePointsHome: exampleData.quarterOnePointsHome,
      quarterThreePointsAway: exampleData.quarterThreePointsAway,
      quarterThreePointsHome: exampleData.quarterThreePointsHome,
      quarterTwoPointsAway: exampleData.quarterTwoPointsAway,
      quarterTwoPointsHome: exampleData.quarterTwoPointsHome,
      winner: exampleData.winner,
    });

    const boxScoreAwayRef = gameDocRef.collection("BoxScoreAway");
    for (const [playerName, playerData] of Object.entries(exampleData.BoxScoreAway)) {
      await boxScoreAwayRef.doc(playerName).set(playerData);
    }

    const boxScoreHomeRef = gameDocRef.collection("BoxScoreHome");
    for (const [playerName, playerData] of Object.entries(exampleData.BoxScoreHome)) {
      await boxScoreHomeRef.doc(playerName).set(playerData);
    }

    console.log("Game data uploaded successfully!");
  } catch (error) {
    console.error("Error uploading game data:", error);
  }
};

// Call the function
uploadGameData();
