import React, { useState, useEffect } from 'react';
import Slider, { Range } from 'rc-slider';
import Tooltip from 'rc-tooltip';
import Highlightable from 'highlightable';
// import jsonData from '../data/dialogsumdata.json';
import jsonData from '../data/dialogsumtraincombined.json';

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
  // if (!location.state || !location.state.name || location.state.name=="") {
  //   console.log('no name!!!1')
  //   history.push("/")
  // }
  // if (localStorage.getItem('name') && localStorage.getItem('name')!="") {
  //   setName(localStorage.getItem('name'))
  // } else {
  //   console.log('no name!!!1')
  //   history.push("/")
  // }
  
  // '#ffcc80'


  useEffect(() => {
    // if (!location.state || !location.state.name || location.state.name=="") {
    //   console.log('no name!!!1')
    //   history.push("/")
    // }

    if (localStorage.getItem('name') && localStorage.getItem('name')!="") {
      setName(localStorage.getItem('name'))
    } else {
      // console.log('no name!!!1')
      history.push("/")
    }

  }, []);

  const getDocument = async () => {
    let texts = JSON.parse(JSON.stringify(jsonData))
    texts = texts.slice(0,100)
    let text = texts[Math.floor(Math.random() * texts.length)]
    // text = texts[0]  
    let lines = text.dialogue.split("\n")
    let expandedLines = []
    lines.forEach(line => {
      expandedLines.push([line])
    });
    // console.log(text)
    // console.log(expandedLines)
    setDocument(text);
    setDialogueLines(expandedLines)
    setRangeList([])
    const myset = new Set()
    // while (myset.size!=4) {
    for (let i = 0; i  < 4; i++) {
      let bucket = [0,1,3,4]
      let randomIndex1 = Math.floor(Math.random()*bucket.length);
      let randnum1 = bucket.splice(randomIndex1, 1)[0];
      let randomIndex2 = Math.floor(Math.random()*bucket.length);
      let randnum2 = bucket.splice(randomIndex2, 1)[0];
      console.log(randnum2, randnum1)
      if (randnum2>randnum1) {
        myset.add(randnum1+' '+randnum2)
      } else {
        myset.add(randnum2+' '+randnum1)
      }
    }
    let out = []
    myset.forEach(pair => {
      let vals = pair.split(" ").map(Number);
      out.push(vals)
    });
    // console.log(text)
    // console.log(expandedLines)
    setSummaryPairs(out)

   };

  useEffect(() => {
     getDocument();
   }, []);

  let handleSubmit = async () => {
    const summaryRef = doc(db, 'summaries', document.fname);
    let summaries = []
    for (let j = 0; j < 3; j++) {
        let summary = document["summary"+(j+1).toString()]
        if (summary) {
          summaries.push(summary)
        }
    }
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
            // newintervals.push(intervals[j])
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
          // console.log(val)
          vals.push(val)
          delete newintervals[j]['data'];
          vals2.push(newintervals[j])
        }
        if (vals.length!=0) {
          salientInfo = [...salientInfo, ...vals]
          salientInfoAll = [...salientInfoAll, ...vals2]
        }
      }
      // console.log(salientInfo)


      await setDoc(summaryRef, {
      dialogue: document.dialogue,
      fname: document.fname,
      summary: summaries
    }, { merge: true });
    // console.log(salientInfo)
    // console.log(salientInfoAll)
    // let responsesdoc = {
    //   salientInfo: salientInfo,
    //   salientInfoAll: salientInfoAll,
    //   scores: {
    //     Coherence: criteriaScores['Coherence'],
    //     Accuracy: criteriaScores['Accuracy'],
    //     Coverage: criteriaScores['Coverage'],
    //     Concise: criteriaScores['Concise'],
    //     "Overall Quality": criteriaScores['Overall Quality']
    //   },
    //   summary:  summaryRef,
    //   name: name
    // }
    const docRef = await addDoc(collection(db, "responses"), {
      salientInfo: salientInfo,
      salientInfoAll: salientInfoAll,
      scores: criteriaScores,
      // scores: {
      //   Coherence: criteriaScores['Coherence'],
      //   Accuracy: criteriaScores['Accuracy'],
      //   Coverage: criteriaScores['Coverage'],
      //   Concise: criteriaScores['Concise'],
      //   "Overall Quality": criteriaScores['Overall Quality']
      // },
      summary:  summaryRef,
      name: name
    });



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

  // let callbackSetCoherence = (value) => {
  //   let currScores = criteriaScores
  //   currScores['Coherence'] = value
  //   setCriteriaScores(currScores)
  // }
  // let callbackSetAccuracy = (value) => {
  //   let currScores = criteriaScores
  //   currScores['Accuracy'] = value
  //   setCriteriaScores(currScores)
  // }
  // let callbackSetCoverage = (value) => {
  //   let currScores = criteriaScores
  //   currScores['Coverage'] = value
  //   setCriteriaScores(currScores)
  // }
  // let callbackSetConcise = (value) => {
  //   let currScores = criteriaScores
  //   currScores['Concise'] = value
  //   setCriteriaScores(currScores)
  // }
  // let callbackSetOverall = (value) => {
  //   let currScores = criteriaScores
  //   currScores['Overall Quality'] = value
  //   setCriteriaScores(currScores)
  // }
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
        <h2>Hello {name}! Please Highlight the Dialogue below!</h2>
        <h4>Please do not highlight more that one line together:</h4>
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
