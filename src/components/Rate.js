import React, { useState, useEffect } from 'react';
import Slider, { Range } from 'rc-slider';
import Tooltip from 'rc-tooltip';
import Highlightable from 'highlightable';
import jsonData from '../data/dialogsumdata.json';
// import RaisedButton  from 'material-ui/RaisedButton';
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
  let [criteriaScores, setCriteriaScores] = useState({'Coherence':0, 'Accuracy':0, 'Coverage':0, 'Concise':0, 'Overall Quality':0})
  let [annotating, setAnnotating] = useState(true)
  let [salientInfo, setSalientInfo] = useState([])
  // let [highlightsLeft, setHighlightsLeft] = useState({'Salient Information':  })
  let [color, setColor] = useState('#ffcc80')
  let [rangeList, setRangeList] = useState([])
  const location = useLocation();
  let history = useHistory();
  console.log(location)
  if (!location.state || !location.state.name || location.state.name=="") {
    console.log('no name!!!1')
    history.push("/")
  }
  
  // '#ffcc80'


  useEffect(() => {
    if (!location.state || !location.state.name || location.state.name=="") {
      console.log('no name!!!1')
      history.push("/")
    }
    console.log('effect');
    // const snapshot = db.collection('summaries').get()
    const getSummaries = async () => {
      const querySnapshot = await getDocs(collection(db, "summaries"));
      // console.log(querySnapshot)
      querySnapshot.forEach((doc) => {
        // console.log(`${doc.id} => ${doc.data()}`);
    });
    }
    getSummaries()
  }, []);




  const getDocument = async () => {
    let texts = JSON.parse(JSON.stringify(jsonData))
    let text = texts[Math.floor(Math.random() * texts.length)]
    // text = texts[0]  
    let lines = text.dialogue.split("\n")
    let expandedLines = []
    lines.forEach(line => {
      expandedLines.push([line])
    });
    console.log(text)
    console.log(expandedLines)
    setDocument(text);
    setDialogueLines(expandedLines)
    setRangeList([])
    setSalientInfo([])
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
          // console.log(intervals[j])
          newintervals.push(intervals[j])
          // console.log(newintervals)
        } else {
          if (intervals[j].start <= newintervals[newintervals.length-1].end) {
            newintervals[newintervals.length-1].end = Math.max( newintervals[newintervals.length-1].end, intervals[j].end)
          } else {
            newintervals.push(intervals[j])
          }
        }
      }
        let vals = []
        // console.log(intervals)
        // console.log(newintervals)
        for (let j = 0; j <newintervals.length; j++) {
          let val = newintervals[j].data.text.slice(newintervals[j].start, newintervals[j].end + 1)
          console.log(val)
          vals.push(val)
        }
        if (vals.length!=0) {
          salientInfo.push(vals)
        }
      }
      // console.log(salientInfo)


    //   await setDoc(summaryRef, {
    //   dialogue: document.dialogue,
    //   fname: document.fname,
    //   summary: summaries
    // }, { merge: true });

    // const docRef = await addDoc(collection(db, "responses"), {
    //   salientInfo: salientInfo,
    //   scores: {
    //     Coherence: criteriaScores['Coherence'],
    //     Accuracy: criteriaScores['Accuracy'],
    //     Coverage: criteriaScores['Coverage'],
    //     Concise: criteriaScores['Concise'],
    //     "Overall Quality": criteriaScores['Overall Quality']
    //   },
    //   summary:  summaryRef
    //   name: location.state.name
    // });

 


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
    console.log(criteriaScores)
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

  function customRenderer(currentRenderedNodes, currentRenderedRange, currentRenderedIndex, onMouseOverHighlightedWord) {
    return tooltipRenderer(currentRenderedNodes, currentRenderedRange, currentRenderedIndex, onMouseOverHighlightedWord);
  }

  function tooltipRenderer(lettersNode, range, rangeIndex, onMouseOverHighlightedWord) {
    console.log(range.data.id, rangeIndex)
    return (<Tooltip key={`${range.data.id}-${rangeIndex}`} onVisibleChange={onMouseOverHighlightedWord}
                        placement="top"
                        overlay={<button type="primary" onClick={() => resetHightlight(range)} >Reset Highlight</button>}
                        defaultVisible={true}
                        animation="zoom">
        <span>{lettersNode}</span>
    </Tooltip>);
  }

  function resetHightlight(range) {
    console.log(range)
    for (let i = 0; i < dialogueLines.length; i++) {
      console.log(dialogueLines[i])
      console.log('jflk')
      const index = dialogueLines[i].indexOf(range);
      if (index > -1) {
        dialogueLines[i].splice(index, 1);
      }
      for (let j = 1; j < dialogueLines[i]-1; j++) {
        salientInfo.push(dialogueLines[i][j].text)
      }
    }

  }


  let undoHighlight = () => {
    let newdialogline = undefined
    let index
    if (rangeList.length>0) {
      for (let i = 0; i < dialogueLines.length; i++) {
        let idx = dialogueLines[i].indexOf(rangeList[rangeList.length - 1])
        console.log(idx, i, rangeList[-1])
        if (idx>-1) {
          newdialogline = [...dialogueLines[i].slice(0, idx), ...dialogueLines[i].slice(idx + 1)]
          index = i
        }
      }
      console.log(dialogueLines)
      console.log(rangeList)
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
    <div className="App">
      <div>
        <h2>Please Highlight the Dialogue below!</h2>
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
          : <></>}
          </div>
        ) ) }
        </div>
        <div className="ColorButtons">
          <button type="primary" onClick={() => undoHighlight(color)} > Undo Highlight </button>
        </div>
        </div> 
        : <></>
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

export default Rate;