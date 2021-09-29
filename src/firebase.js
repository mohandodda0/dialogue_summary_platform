// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// const admin = require('firexbase-admin');
// import firestore from "./firestore";
// import "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
// import jsonData from './data/dialogsumtest.json';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBn8UlIrBqZzILxUlFRofc0k-3U1p6c80Y",
  authDomain: "dialogue-summary-platform.firebaseapp.com",
  projectId: "dialogue-summary-platform",
  storageBucket: "dialogue-summary-platform.appspot.com",
  messagingSenderId: "876002399014",
  appId: "1:876002399014:web:1195c8d72605fa0c7467e7",
  measurementId: "G-QDNY7RFRTS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const db = getFirestore();


// async function s() {
//     const querySnapshot = await getDocs(collection(db, "summaries"));
//     querySnapshot.forEach((doc) => {
//         console.log(`${doc.id} => ${doc.data()}`);
//     });
// }
// s()
// async function s2() {


//     let texts = JSON.parse(JSON.stringify(jsonData))

//     for (let i = 0; i < texts.length; i++) {

//         for (let j = 0; j < 3; j++) {
//             if (texts[i]["summary"+j.toString()]) {
//                 console.log(texts[i]["summary"+j.toString()])
//             }
            
//         }
//     }
// }
// s2()

// admin.initializeApp();

// export const db = admin.firestore();