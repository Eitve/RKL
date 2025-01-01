import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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
const firestore = getFirestore(app);

export default firestore;
export { firestore };