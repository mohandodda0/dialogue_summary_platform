import React, { useState, useEffect } from 'react';
import Slider, { Range } from 'rc-slider';
import Tooltip from 'rc-tooltip';
import Highlightable from 'highlightable';
import jsonData from '../data/dialogsumdata.json';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import 'rc-slider/assets/index.css';
import fs from "fs";
import { db } from '../firebase'; // add
import { collection, getDocs, doc, setDoc, getDoc, where, query  } from 'firebase/firestore';
// import { } from "firebase/firestore"; 
import { Pagination } from 'antd';
import { useHistory, useLocation } from "react-router-dom";
import '../App.css';

function PrevRated() {
  let [document, setDocument] = useState({})
  let [dialogueLines, setDialogueLines] = useState([])
  let [criteriaScores, setCriteriaScores] = useState({'Coherence':0, 'Accuracy':0, 'Coverage':0, 'Concise':0, 'Overall Quality':0})
  let [annotating, setAnnotating] = useState(true)
  // let [highlightsLeft, setHighlightsLeft] = useState({'Salient Information':  })
  let [color, setColor] = useState('#ffcc80')
  let [rangeList, setRangeList] = useState([])
  const location = useLocation();
  let history = useHistory();
  let [name, setName] = useState("")
  let [allData, setAllData] = useState([])
  let [allSummaries, setAllSummaries] = useState([])
  let [allDialogueLines, setAllDialogueLines] = useState([])
  let [page, setPage] = useState(1)

  
  const getDocuments = async () => {
    const stateQuery = query(collection(db, "responses"), where("name", "==", localStorage.getItem('name')));
    const querySnapshot = await getDocs(stateQuery);
    // console.log(querySnapshot)
    let d = []
    querySnapshot.forEach((doc) => {
        // console.log(doc.data())
        // console.log(doc.data().salientInfoAll)
        // doc.data() is never undefined for query doc snapshots
        d.push(doc.data())
      });
    console.log('lasty', d)
    setAllData(d)
    let dialogueLinesAll = []
    let smmrys = []
    for (let i = 0; i < d.length; i++) {
      const docSnap = await getDoc(d[i].summary);
      let smmrydata = docSnap.data()
      if (smmrydata) {
        smmrys.push(smmrydata.summary)
        let dialogueLines = []
        let salientInfoAllOne = [...d[i].salientInfoAll].reverse()
        let lines = smmrydata.dialogue.split("\n")
        for (let j = 0; j < lines.length; j++) {
          let line = [lines[j]]
          // dialogueLines.push(lines[j])
          while (salientInfoAllOne.length > 0 && salientInfoAllOne[salientInfoAllOne.length-1].lineno==j) {
            line.push(salientInfoAllOne.pop())
          }
          dialogueLines.push(line)
        }
        dialogueLinesAll.push(dialogueLines)
      }
    }
    setAllDialogueLines(dialogueLinesAll)
    setAllSummaries(smmrys)
    // console.log('ehrererere')
    // console.log(d, smmrys, dialogueLinesAll)
    // console.log(d)
    // console.log(smmrys)
    // console.log(dialogueLinesAll.length)
    // console.log(dialogueLinesAll[0])
   };


  useEffect(() => {
    if (localStorage.getItem('name') && localStorage.getItem('name')!="") {
        setName(localStorage.getItem('name'))
      } else {
        console.log('no name!!!1')
        history.push("/")
      }
      getDocuments()
  }, []);

  let criterias = ['Coherence', 'Accuracy', 'Coverage', 'Concise', 'Overall Quality']
//   let criteriaChangeFunctions = {'Coherence':callbackSetCoherence, 'Accuracy':callbackSetAccuracy, 'Coverage':callbackSetCoverage, 'Concise':callbackSetConcise, 'Overall Quality':callbackSetOverall}
  
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
  
  let onChange = (value) => {
    setPage(value)
  }
  
  return (
    <div className="Rate">
      <div>
        <h2>{name}'s Previously Rated Dialogue</h2>
        <h3>Your Results for Particular Dialogue</h3>
        </div>
        
        { (allData && allData.length!=0 && allSummaries && allSummaries.length!=0 && allDialogueLines && allDialogueLines.length!=0) ? <> 
        <h4>Your Highlighted Salient Information</h4>
      {
        allDialogueLines[page-1] ? 
        <div className='Summaries'>
          <div className="SummaryVal">
        { allDialogueLines[page-1].map((line) =>(
          <div className="RubricText"> 
          {line ? 
           <Highlightable 
          //  ranges={}
            ranges={line.slice(1,line.length)}
            enabled={false}
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
        </div> 
        : <></>
      }
        <div className="finalbutton"> 
         {  (allSummaries && allSummaries[0] && allSummaries[0].length>1)  ? 
        <div className="Summaries" >
          <div className="SummaryVal">
            <div><h2>Summary A</h2></div>
            {allSummaries[page-1][0]}
            </div>
          <div className="SummaryVal"><div><h2>Summary B</h2></div>
            {allSummaries[page-1][1]}
            </div>
        </div>
        : <></>}  
        {criterias.map((criteria) => (
                      <div className="ratings">
                        <div className="ratingstext">
                            <h3> You gave {criteria} a score of this   {allData[page-1].scores[criteria]}  </h3>
                        </div>
                      <Slider  min={-2} max={2} marks={marks} step={null}  value={allData[page-1].scores[criteria] || 0} disabled={true}/>
                      </div>
              ))}
      </div>

      <Pagination simple onChange={onChange} defaultCurrent={1} total={allDialogueLines.length} pageSize={1} />


        </>:<></>}

    </div>
  );
}

export default PrevRated;
