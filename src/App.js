import React, { useState, useEffect } from 'react';
import Slider, { Range } from 'rc-slider';
import Highlightable from 'highlightable';
import jsonData from './data/dialogsumdata.json';
import 'rc-slider/assets/index.css';
import fs from "fs";
import { db } from './firebase'; // add
import { collection, getDocs, doc, setDoc, getDoc, addDoc  } from 'firebase/firestore';
// import { } from "firebase/firestore"; 
import { Button } from 'antd';
import './App.css';

function App() {
  let [document, setDocument] = useState({})
  let [dialogueLines, setDialogueLines] = useState([])
  let [criteriaScores, setCriteriaScores] = useState({'Coherence':-1, 'Accuracy':-1, 'Coverage':-1, 'Concise':-1, 'Overall Quality':-1})
  let [annotating, setAnnotating] = useState(true)
  let [salientInfo, setSalientInfo] = useState([])

  let showSummary = () => {
    setAnnotating(false)
  }


  useEffect(() => {

    console.log('effect');
    // const snapshot = db.collection('summaries').get()
    const getSummaries = async () => {
      const querySnapshot = await getDocs(collection(db, "summaries"));
      // console.log(querySnapshot)
      querySnapshot.forEach((doc) => {
        // console.log(`${doc.id} => ${doc.data()}`);
    });

    }
    // snapshot.forEach(doc => {
    //   console.log(doc.id, '=>', doc.data());
    // });
    getSummaries()
  }, []);




  const getDocument = async () => {
    let texts = JSON.parse(JSON.stringify(jsonData))
    let text = texts[Math.floor(Math.random() * texts.length)]
    let summaries = []
    for (let j = 0; j < 3; j++) {
        let summary = text["summary"+(j+1).toString()]
        if (text["summary"+(j+1).toString()]) {
          // console.log(text["summary"+(j+1).toString()])
        }
    }

    // text = texts[0]  
    let lines = text.dialogue.split("\n")
    let expandedLines = []
    lines.forEach(line => {
      expandedLines.push([line])
    });
    setDocument(text);
    setDialogueLines(expandedLines)
   };

  useEffect(() => {
     getDocument();
   }, []);

  let handleSubmit = async () => {

    const summaryRef = doc(db, 'summaries', document.fname);
    // console.log(summaryRef.get())

    let summaries = []
    for (let j = 0; j < 3; j++) {
        let summary = document["summary"+(j+1).toString()]
        if (summary) {
          // console.log(document["summary"+(j+1).toString()])
          summaries.push(summary)
        }
    }
    let salientInfo = []
    for (let i = 0; i < dialogueLines.length; i++) {
      for (let j = 1; j < dialogueLines[i]-1; j++) {
        salientInfo.push(dialogueLines[i][j].text)
      }
    }
    // doc('users/' + user_key)

    const docRef = await addDoc(collection(db, "responses"), {
      salientInfo: salientInfo,
      scores: {
        Coherence: criteriaScores['Coherence'],
        Accuracy: criteriaScores['Accuracy'],
        Coverage: criteriaScores['Coverage'],
        Concise: criteriaScores['Concise'],
        "Overall Quality": criteriaScores['Overall Quality']
      },
      summary:  summaryRef
    });

     await setDoc(summaryRef, {
      dialogue: document.dialogue,
      fname: document.fname,
      summary: summaries
    }, { merge: true });


    setAnnotating(true)
    setCriteriaScores({'Coherence':-1, 'Accuracy':-1, 'Coverage':-1, 'Concise':-1, 'Overall Quality':-1})
    getDocument()
  }

  let callbackSetCoherence = (value) => {
    let currScores = criteriaScores
    currScores['Coherence'] = value
    console.log(dialogueLines)
    setCriteriaScores(currScores)
  }
  let callbackSetAccuracy = (value) => {
    let currScores = criteriaScores
    currScores['Accuracy'] = value
    setCriteriaScores(currScores)
  }
  let callbackSetCoverage = (value) => {
    let currScores = criteriaScores
    currScores['Coverage'] = value
    setCriteriaScores(currScores)
  }
  let callbackSetConcise = (value) => {
    let currScores = criteriaScores
    currScores['Concise'] = value
    setCriteriaScores(currScores)
  }
  let callbackSetOverall = (value) => {
    let currScores = criteriaScores
    currScores['Overall Quality'] = value
    setCriteriaScores(currScores)
  }
  let criterias = ['Coherence', 'Accuracy', 'Coverage', 'Concise', 'Overall Quality']
  let criteriaChangeFunctions = {'Coherence':callbackSetCoherence, 'Accuracy':callbackSetAccuracy, 'Coverage':callbackSetCoverage, 'Concise':callbackSetConcise, 'Overall Quality':callbackSetOverall}
  
  let marks= {

      "-2": ' A mostly better',
      "-1": 'A partially better',
      0: 'both  equal',
      1: 'B partially better',
      2: 'B mostly better'
  };


  
  let onMouseOverHighlightedWordCallback = (range) => {}
  let onTextHighlightedCallback = (range) => {  
    let newDialogueLines = []
    dialogueLines.forEach(line => {
      if (line[0]==range.data.text) {
        line.push(range)
      }
      newDialogueLines.push(line)
    });
    setDialogueLines(newDialogueLines)
  }
  // console.log(document)
  
  return (
    <div className="App">
      <div>
        <h2>Please Highlight the Dialogue below!</h2>
        <h4>Please do not highlight more that one line together:</h4>
      </div>
      {
        dialogueLines ? 
        <>
        { Array.from({length: dialogueLines.length}, (_, i) => i + 1).map((num) =>(
          <div className="RubricText"> 
          {dialogueLines[num]? 
           <Highlightable 
          //  ranges={}
           ranges={dialogueLines[num].slice(1,dialogueLines[num].length)}
            enabled={annotating}
            onTextHighlighted={onTextHighlightedCallback}
            id={1}
            onMouseOverHighlightedWord={onMouseOverHighlightedWordCallback}
            highlightStyle={{
              backgroundColor: '#ffcc80'
            }}
            text={dialogueLines[num][0] || ""}
   />
          : <></>}
          </div>
        ) ) }
        </> : <></>
      }

      {
        annotating ? <div>
              <div>
                Click Below once you are done annotating
              </div>
            <Button type="primary" onClick={showSummary} >Done Annotation</Button>
        </div>: <></>
      }
   
      {annotating ?  <></>:
        
        <div className="finalbutton"> 
        <div className="Summaries" >
          <div className="SummaryVal">
            <div><h2>Summary A</h2></div>
            
            {document.summary1}
            </div>
          <div>
          <div className="SummaryVal"><h2>Summary B</h2></div>
            {document.summary2}
            </div>
        </div>
        {criterias.map((criteria) => (
                      <div className="ratings">
                        <div className="ratingstext">
                            <h3>Please compare the two above summaries in regards to their {criteria}</h3>
                        </div>
                      <Slider  min={-2} max={2} marks={marks} step={null} onChange={criteriaChangeFunctions[criteria]} defaultValue={0} />
                      </div>
              ))}
              <div className="finalbutton">         <Button type="primary" onClick={handleSubmit} >Submit Results</Button>
 </div>

      </div>
      }
      
        {/* <Slider  min={1} marks={marks('Coherence')} step={null} onChange={criteriaChangeFunctions['Coherence']} defaultValue={-1} /> */} 
    </div>
  );
}

export default App;
