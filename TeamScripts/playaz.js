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

const teamId = 'sirvintosUHBGroup';
const players = [
  {
    firstName: 'Simonas',
    lastName: 'Švelnys',
    dob: '2006-05-25',
    photoURL: 'https://images.statsengine.playbyplay.api.geniussports.com/1408f12ed9b4234855fc220ceb1e8c4eT1.png',
    position:  'PG',
    shirtNumber: 0,
    weight:     70,
    height:     178,
    age:         18,
  },
  {
    firstName: 'Rokas',
    lastName: 'Jukonis',
    dob: '1990-05-02',
    photoURL: 'https://images.statsengine.playbyplay.api.geniussports.com/95d352e99e50bf305fba135146c2bea8T1.png',
    position:  'SG',
    shirtNumber: 1,
    weight:      100,
    height:      194,
    age:         34,
  },
  {
    firstName: 'Tautvydas Kazimieras',
    lastName: 'Vyšniauskas',
    dob: '1998-03-04',
    photoURL: 'https://images.statsengine.playbyplay.api.geniussports.com/9e1ff142f5316433ad28faa1a86457c6T1.png',
    position:  'SF',
    shirtNumber: 10,
    weight:      103,
    height:      200,
    age:         26,
  },
  {
    firstName: 'Aurimas',
    lastName: 'Maščinskas',
    dob: '2004-11-09',
    photoURL: 'https://images.statsengine.playbyplay.api.geniussports.com/962c1de3266ee166fb0c77db10d7894fT1.png',
    position:  'PF',
    shirtNumber: 11,
    weight:      94,
    height:      199,
    age:         20,
  },
  {
    firstName: 'Julius',
    lastName: 'Ščipokas',
    dob: '1993-10-31',
    photoURL: 'https://images.statsengine.playbyplay.api.geniussports.com/fd79c85a72f1a7248d62e449dd23d15fT1.png',
    position:  'PG',
    shirtNumber: 12,
    weight:      83,
    height:      175,
    age:         31,
  },
  {
    firstName: 'Gytis',
    lastName: 'Auruškevičius',
    dob: '2004-05-19',
    photoURL: 'https://images.statsengine.playbyplay.api.geniussports.com/d572c12d0ef5af554fa8e650a5739ce9T1.png',
    position:  'C',
    shirtNumber: 13,
    weight:      100,
    height:      204,
    age:         20,
  },
  {
    firstName: 'Arnas',
    lastName: 'Bulonas',
    dob: '2010-08-02',
    photoURL: 'https://images.statsengine.playbyplay.api.geniussports.com/13c34a5c2010e8602c6b016b983e6056T1.png',
    position:  'SG',
    shirtNumber: 14,
    weight:      68,
    height:      184,
    age:         14,
  },
  {
    firstName: 'Edvinas',
    lastName: 'Jezukevičius',
    dob: '1990-04-08',
    photoURL: 'https://images.statsengine.playbyplay.api.geniussports.com/d1d1d73d2730a0e297a620a39f08028fT1.png',
    position:  'C',
    shirtNumber: 15,
    weight:      115,
    height:      207,
    age:         34,
  },
  {
    firstName: 'Gabrielis',
    lastName: 'Tiesnesis',
    dob: '2007-09-16',
    photoURL: 'https://www.rkl.lt/wp-content/uploads/2024/10/default_player_image.png',
    position:  'SG',
    shirtNumber: 16,
    weight:      80,
    height:      182,
    age:         17,
  },
  {
    firstName: 'Tomas',
    lastName: 'Išaras',
    dob: '2004-08-19',
    photoURL: 'https://images.statsengine.playbyplay.api.geniussports.com/1b74055c640fc28761d8df8ab1fb1916T1.png',
    position:  'PF',
    shirtNumber: 19,
    weight:      120,
    height:      198,
    age:         20,
  },
  {
    firstName: 'Martynas',
    lastName: 'Butrimas',
    dob: '2003-12-11',
    photoURL: 'https://www.rkl.lt/wp-content/uploads/2024/10/default_player_image.png',
    position:  'PG/SG',
    shirtNumber: 23,
    weight:      83,
    height:      191,
    age:         21,
  },
  {
    firstName: 'Vaidas',
    lastName: 'Bendikas',
    dob: '1988-05-26',
    photoURL: 'https://images.statsengine.playbyplay.api.geniussports.com/5a0a4cfa69554d04d97190e2961a3e09T1.png',
    position:  'SG',
    shirtNumber: 24,
    weight:      90,
    height:      191,
    age:         36,
  },
  {
    firstName: 'Paulius',
    lastName: 'Čiūta',
    dob: '2004-01-24',
    photoURL: 'https://images.statsengine.playbyplay.api.geniussports.com/f9b03f68c55917c13c2c4811039327d7T1.png',
    position:  'SG',
    shirtNumber: 34,
    weight:      84,
    height:      194,
    age:         20,
  },
  {
    firstName: 'Naglis',
    lastName: 'Šadreika',
    dob: '2004-04-07',
    photoURL: 'https://images.statsengine.playbyplay.api.geniussports.com/76f4e4a81b25ae4bc8643157752d56e7T1.png',
    position:  'SG',
    shirtNumber: 4,
    weight:      84,
    height:      194,
    age:         20,
  },
  {
    firstName: 'Marius',
    lastName: 'Dubininkas',
    dob: '1990-04-26',
    photoURL: 'https://images.statsengine.playbyplay.api.geniussports.com/76f4e4a81b25ae4bc8643157752d56e7T1.png',
    position:  'PG',
    shirtNumber: 6,
    weight:      90,
    height:      185,
    age:         34,
  },
  {
    firstName: 'Tautvydas',
    lastName: 'Milašas',
    dob: '1997-12-23',
    photoURL: 'https://images.statsengine.playbyplay.api.geniussports.com/214cf23ec80a5cc3a3ba9c47881d212dT1.png',
    position:  'SG',
    shirtNumber: 7,
    weight:      77,
    height:      185,
    age:         27,
  },
  {
    firstName: 'Pijus',
    lastName: 'Čiūta',
    dob: '2005-05-14',
    photoURL: 'https://images.statsengine.playbyplay.api.geniussports.com/35a26be92404cc1b0c3aa704c74e71d9T1.png',
    position:  'SF',
    shirtNumber: 8,
    weight:      78,
    height:      190,
    age:         19,
  },
  {
    firstName: 'Titas',
    lastName: 'Pundinas',
    dob: '2005-07-03',
    photoURL: 'https://images.statsengine.playbyplay.api.geniussports.com/0a9c39d57b53c88a2f70a848bc6d5d1fT1.png',
    position:  'PG',
    shirtNumber: 88,
    weight:      80,
    height:      180,
    age:         19,
  },
  {
    firstName: 'Džiugas',
    lastName: 'Janovskis',
    dob: '2005-05-09',
    photoURL: 'https://images.statsengine.playbyplay.api.geniussports.com/cc0589e0ed593cab74450c06b1fc4e11T1.png',
    position:  'PG',
    shirtNumber: 9,
    weight:      87,
    height:      193,
    age:         19,
  },
  {
    firstName: 'Martynas',
    lastName: 'Ramanauskas',
    dob: '2005-04-29',
    photoURL: '',
    position:  'https://images.statsengine.playbyplay.api.geniussports.com/93d44c21d1a16d5ace36f48db99fc2a2T1.png',
    shirtNumber: 91,
    weight:      95,
    height:      200,
    age:         19,
  },
];

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