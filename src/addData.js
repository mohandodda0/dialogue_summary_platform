
// import { collection, getDocs, doc, setDoc, getDoc, addDoc  } from 'firebase/firestore';
// {doc, setDoc} = require('firebase/firestore')
import { db } from '../firebase'; // add
import jsonData from 'data/dialogsumtraincombined.json';
const addDocuments = async () => {
    let texts = JSON.parse(JSON.stringify(jsonData))
    texts = texts.slice(0,1039)
    let summaryRef;
    texts.forEach(async function(document) {
        summaryRef = db.collection('cities').doc(document.fname);
        // summaryRef = doc(db, 'summaries', );
        await setDoc(summaryRef, {
            dialogue: document.dialogue,
            fname: document.fname,
            evaluated: true
          }, { merge: true });
      }) 
    
}


addDocuments()
 .then(() => {
    console.log('2');
 });
