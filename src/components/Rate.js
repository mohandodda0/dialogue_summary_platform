import React, { useState, useEffect } from 'react';
import Slider, { Range } from 'rc-slider';
import Tooltip from 'rc-tooltip';
import Highlightable from 'highlightable';
// import jsonData from '../data/dialogsumdata.json';
import jsonData from '../data/dialogsumtraincombined.json';

import whichAnnotationsJson from '../config/testannotations.json';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import 'rc-slider/assets/index.css';
import fs from "fs";
import { db } from '../firebase'; // add
import { collection, getDocs, doc, setDoc, getDoc, addDoc  } from 'firebase/firestore';
// import { } from "firebase/firestore"; 
import { Button } from 'antd';
import { useHistory, useLocation } from "react-router-dom";
import '../App.css';

function Rate() {
  let [document, setDocument] = useState({})
  let [dialogueLines, setDialogueLines] = useState([])
  let [criteriaScores, setCriteriaScores] = useState({})
  let [gradingTestAnnotation, setGradingTestAnnotation] = useState(false)
  // let [criteriaScoresList, setCriteriaScoresList] = useState([])
  let [annotating, setAnnotating] = useState(true)
  // let [highlightsLeft, setHighlightsLeft] = useState({'Salient Information':  })
  let [color, setColor] = useState('#ffcc80')
  let [rangeList, setRangeList] = useState([])
  let [name, setName] = useState("")
  const location = useLocation();
  let history = useHistory();
  // console.log(localStorage.getItem('name'))
  let [summaryPairs, setSummaryPairs] = useState([])
  const summarymodels = ['Salesforce/bart-large-xsum-samsum', 'philschmid/distilbart-cnn-12-6-samsum', 'henryu-lin/t5-large-samsum-deepspeed', 'linydub/bart-large-samsum', 'knkarthick/meeting-summary-samsum']
  // const testannotations = whichAnnotationsJson['annotationsidxs']
  // console.log(testannotations)

  useEffect(() => {
    if (localStorage.getItem('name') && localStorage.getItem('name')!="") {
      setName(localStorage.getItem('name'))
      getDocument();
    } else {
      history.push("/")
    }
  }, []);

  const getDocument = async () => {
    let texts = JSON.parse(JSON.stringify(jsonData))
    let localname = localStorage.getItem('name')
    console.log(localname)
    console.log(name)
    const annotatorRef = doc(db, 'annotators2', localname);
    console.log(annotatorRef)
    let annotatorDoc = await getDoc(annotatorRef)
    let annotatorData;
    if (annotatorDoc.exists()) {
      console.log("Document data:", annotatorDoc.data());
      annotatorData = annotatorDoc.data()
    } else {
      await setDoc(annotatorRef, { name: localname, testannotations: [] }, { merge: true })
      annotatorData = { name: localname, testannotations: [] }
    }

    let text;
    let testannotationlength = annotatorData.testannotations.length
    // console.log(testannotationlength)
    // console.log('herere',testannotations.length )
    let testannotationsfromfile;
    console.log(Object.keys(whichAnnotationsJson))
    console.log(localname)
    if (localname in whichAnnotationsJson) {
      testannotationsfromfile = whichAnnotationsJson[localname]
      console.log('here boi')
    } else {
      testannotationsfromfile = whichAnnotationsJson['annotationsidxs']
      console.log('no here boi')
    }
    if (testannotationlength<testannotationsfromfile.length) {
      text = texts[testannotationsfromfile[testannotationlength]]
      setGradingTestAnnotation(true)
    } else {
      text = texts[Math.floor(Math.random() * texts.length)]
      setGradingTestAnnotation(false)
    }
    // texts = texts.slice(0,1039)

    
    let lines = text.dialogue.split("\n")
    let expandedLines = []
    lines.forEach(line => {
      expandedLines.push([line])
    });

    setDocument(text);
    setDialogueLines(expandedLines)
    setRangeList([])
    // const myset = new Set()

    
    // let out = []
    // myset.forEach(pair => {
    //   let vals = pair.split(" ").map(Number);
    //   out.push(vals)
    // });
    let out = [[0,3], [1,4], [3,4]]
    setSummaryPairs(out)
    console.log(out, text)
   };

  // useEffect(() => {
  //    getDocument();
  //  }, []);

  let handleSubmit = async () => {
    let currScores = criteriaScores
    const summaryRef = doc(db, 'summaries', document.fname);
    let salientInfo = []
    let salientInfoAll = []
    for (let i = 0; i < dialogueLines.length; i++) {
      let intervals = dialogueLines[i].slice(1)
      intervals = intervals.sort(function(a, b) {
        if (a.start < b.start) return -1;
        if (a.start > b.start) return 1;
        return 0;
      });
      let newintervals = []
      for (let j = 0; j <intervals.length; j++) {
        if (newintervals.length==0) {
          newintervals.push({
            ...intervals[j],
            lineno: i
          })
        } else {
          if (intervals[j].start <= newintervals[newintervals.length-1].end) {
            newintervals[newintervals.length-1].end = Math.max( newintervals[newintervals.length-1].end, intervals[j].end)
          } else {
            newintervals.push({
              ...intervals[j],
              lineno: i
            })
          }
        }
      }
        let vals = []
        let vals2 = []
        for (let j = 0; j <newintervals.length; j++) {
          let val = newintervals[j].data.text.slice(newintervals[j].start, newintervals[j].end + 1)
          vals.push(val)
          delete newintervals[j]['data'];
          vals2.push(newintervals[j])
        }
        if (vals.length!=0) {
          salientInfo = [...salientInfo, ...vals]
          salientInfoAll = [...salientInfoAll, ...vals2]
        }
      }


      await setDoc(summaryRef, {
      dialogue: document.dialogue,
      fname: document.fname,
      // summary: summaries,
      evaluated: true
      
    }, { merge: true });

    summaryPairs.forEach((pair) => {
      let key = summarymodels[pair[0]]+' vs ' +summarymodels[pair[1]]
      if (!(key in currScores)) {
        currScores[key] = {'Coherence':0, 'Accuracy':0, 'Coverage':0, 'Concise':0, 'Overall Quality':0}
      }
    });

    const docRef = await addDoc(collection(db, "responses"), {
      salientInfo: salientInfo,
      salientInfoAll: salientInfoAll,
      scores: currScores,
      summary:  summaryRef,
      name: name
    });

    if (gradingTestAnnotation) {
      console.log(name)
      const annotatorRef = doc(db, 'annotators2', name);
      let annotatorDoc = await getDoc(annotatorRef)
      let annotatorData;
      if (annotatorDoc.exists()) {
        console.log("Document data:", annotatorDoc.data());
        annotatorData = annotatorDoc.data()
        let oldtestannotations = annotatorData.testannotations
        console.log(annotatorData)
        oldtestannotations.push({
          fname: document.fname,
          scores: currScores,
          salientInfo: salientInfo,
          salientInfoAll: salientInfoAll
        })
        console.log(oldtestannotations)
        await setDoc(annotatorRef, {
          name: name,
          testannotations: oldtestannotations
        }, {merge: true})
      } 

    }

    setAnnotating(true)
    // setCriteriaScores({'Coherence':-1, 'Accuracy':-1, 'Coverage':-1, 'Concise':-1, 'Overall Quality':-1})
    setCriteriaScores({})
    getDocument()
  }

  let setScore = (value, criteria, pair) => {
    // console.log(value, criteria, pair)
    let currScores = criteriaScores
    // currScores[criteria] = value
    // let criterialist = criteriaScoresList
    let key = summarymodels[pair[0]]+' vs ' +summarymodels[pair[1]]
    let passed = false
    Object.keys(currScores).forEach((checkkey) => {
      if (checkkey==key) {
        currScores[key][criteria] = value
        passed = true
      }
    })
    if (!passed) {
      currScores[key] = {'Coherence':0, 'Accuracy':0, 'Coverage':0, 'Concise':0, 'Overall Quality':0}
      currScores[key][criteria] = value
    }
    // console.log(currScores)
    // setCriteriaScoresList(criterialist)
    setCriteriaScores(currScores)
  }

  let criterias = ['Coherence', 'Accuracy', 'Coverage', 'Concise', 'Overall Quality']
  // let criteriaChangeFunctions = {'Coherence':callbackSetCoherence, 'Accuracy':callbackSetAccuracy, 'Coverage':callbackSetCoverage, 'Concise':callbackSetConcise, 'Overall Quality':callbackSetOverall}
  
  let marks= {
      "-2": ' A mostly better',
      "-1": 'A partially better',
      0: 'both  equal',
      1: 'B partially better',
      2: 'B mostly better'
  };


  let undoHighlight = () => {
    let newdialogline = undefined
    let index
    if (rangeList.length>0) {
      for (let i = 0; i < dialogueLines.length; i++) {
        let idx = dialogueLines[i].indexOf(rangeList[rangeList.length - 1])
        // console.log(idx, i, rangeList[-1])
        if (idx>-1) {
          newdialogline = [...dialogueLines[i].slice(0, idx), ...dialogueLines[i].slice(idx + 1)]
          index = i
        }
      }

      if (newdialogline) {
        dialogueLines[index] = newdialogline
        setRangeList(rangeList.slice(0, -1))
        setDialogueLines(dialogueLines)
      }

    }
  }

  let onMouseOverHighlightedWordCallback = (range) => {}
  let onTextHighlightedCallback = (range) => {  
    let newDialogueLines = []
    dialogueLines.forEach(line => {
      if (line[0]==range.data.text) {
        range.data.highlightStyle ={
          backgroundColor: color
        }
        line.push(range)
      }
      newDialogueLines.push(line)
    });
    setDialogueLines(newDialogueLines)
    setRangeList([...rangeList, range])
  }
  // console.log(document)
  
  return (
    <div className="Rate">
      <div>
        <h2>Hello {name}! Please Highlight Dialogue <em>{document.fname}</em> below!</h2>
        <h4>Please do not highlight multiple lines in one highlight.</h4>

      </div>
      {
        dialogueLines ? 
        <div className='Summaries'>
          <div className="SummaryVal">
        { dialogueLines.map((line) =>(
          <div className="RubricText"> 
          {line ? 
           <Highlightable 
          //  ranges={}
            ranges={line.slice(1,line.length)}
            enabled={annotating}
            onTextHighlighted={onTextHighlightedCallback}
            id={1}
            onMouseOverHighlightedWord={onMouseOverHighlightedWordCallback}
            highlightStyle = {{
              backgroundColor: color
            }}
            text={line[0] || ""}
          />
          : <>hi</>}
          </div>
        ) ) }
        </div>
        <div className="ColorButtons">
          <button type="primary" onClick={() => undoHighlight(color)} > Undo Highlight </button>
        </div>
        </div> 
        : <>hi2</>
      }

      {
        annotating ? <div>
              <div>
                Click Below once you are done annotating
              </div>
            <Button type="primary" onClick={()=>setAnnotating(false)} >Done Annotation</Button>
        </div>: <></>
      }
   
      {annotating ?  <></>:

       <>
        {
         summaryPairs.map((pair, index) =>

         <div className="finalbutton"> 

         <div className="Summaries" >
           <div className="SummaryVal">
             <div><h2>Summary A</h2></div>
               {document['summary'+summarymodels[pair[0]]]}
             </div>
           
           <div className="SummaryVal">
             <div><h2>Summary B</h2></div>
               {document['summary'+summarymodels[pair[1]]]}
             </div>
         </div>
         {criterias.map((criteria) => (
                       <div className="ratings">
                         <div className="ratingstext">
                             <h3>Please compare the two above summaries in regards to their {criteria}</h3>
                         </div>
                         <Slider  min={-2} max={2} marks={marks} step={null} onChange={(value) => setScore(value, criteria, pair)} defaultValue={0} />
                       {/* <Slider  min={-2} max={2} marks={marks} step={null} onChange={criteriaChangeFunctions[criteria]} defaultValue={0} /> */}
                       </div>
               ))}
               
       </div>

         )
       }
       <div className="finalbutton">         <Button type="primary" onClick={handleSubmit} >Submit Results</Button>
  </div>
      </>
      
      }
        {/* <Slider  min={1} marks={marks('Coherence')} step={null} onChange={criteriaChangeFunctions['Coherence']} defaultValue={-1} /> */} 
    </div>
  );
}

export default Rate;
