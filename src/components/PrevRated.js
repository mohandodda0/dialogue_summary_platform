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
  let [summaryPairs, setSummaryPairs] = useState([])
  let [allScores, setAllScores] = useState([])
  const summarymodels = ['Salesforce/bart-large-xsum-samsum', 'philschmid/distilbart-cnn-12-6-samsum', 'henryu-lin/t5-large-samsum-deepspeed', 'linydub/bart-large-samsum', 'knkarthick/meeting-summary-samsum']
  let vs = ['Salesforce/bart-large-xsum-samsum vs linydub/bart-large-samsum', 'Salesforce/bart-large-xsum-samsum vs linydub/bart-large-samsum', 'philschmid/distilbart-cnn-12-6-samsum vs knkarthick/meeting-summary-samsum']
  const testannotations = [52, 53, 54, 55, 56, 57, 58, 59, 60, 61]

  const getDocuments = async () => {
    // const stateQuery = query(collection(db, "responses"), where("name", "==", localStorage.getItem('name')));
    // const querySnapshot = await getDocs(stateQuery);
    let localname = localStorage.getItem('name')
    const annotatorRef = doc(db, 'annotators2', localname);
    console.log(annotatorRef)
    let annotatorDoc = await getDoc(annotatorRef)
    let d = []
    annotatorDoc.data().testannotations.forEach((doc) => {
        d.push(doc.data())
      });
    console.log('lasty', d)
    setAllData(d)
    let dialogueLinesAll = []
    let smmrys = []
    let texts = JSON.parse(JSON.stringify(jsonData))
    let out = [[0,3], [1,4], [3,4]]
    let scores = []
    setSummaryPairs(out)
    for (let i = 0; i < d.length; i++) {
      const docSnap = await getDoc(d[i].summary);
      let smmrydata = docSnap.data()
      let arr = smmrydata.fname.split("_")
      let fname = arr[arr.length-1]
      console.log(fname)
      let text = texts[parseInt(fname)]
      let sm = []
      scores.push(d[i].scores)

      out.forEach((pair) => {
        let first = text['summary'+summarymodels[pair[0]]]
        let second = text['summary'+summarymodels[pair[1]]]
        let smmry = [first, second]
        sm.push(smmry)
        // let key = summarymodels[pair[0]]+' vs ' +summarymodels[pair[1]]
        // let smmry = text[first]
        // if (!(key in currScores)) {
        //   currScores[key] = {'Coherence':0, 'Accuracy':0, 'Coverage':0, 'Concise':0, 'Overall Quality':0}
        // }
      });
      smmrys.push(sm)

      let salientInfoAllOne = [...d[i].salientInfoAll].reverse()
      let lines = text.dialogue.split("\n")
      let dialogueLines = []
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
    console.log(dialogueLinesAll)
    setAllDialogueLines(dialogueLinesAll)
    setAllSummaries(smmrys)
    setAllScores(scores)
    console.log(smmrys, dialogueLinesAll, d)
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
        <h2>{name}'s Previously Rated Dialogues</h2>
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
            id={"1"}
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
        {/* <div className="finalbutton"> 
         { (allSummaries && allSummaries[0] && allSummaries[0].length>1)  ? 
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
      </div> */}


      {
         summaryPairs.map((pair, index) =>

         <div className="finalbutton"> 

         <div className="Summaries" >
           <div className="SummaryVal">
             <div><h2>Summary A</h2></div>
               {allSummaries[page-1][index][0]
              //  document['summary'+summarymodels[pair[0]]]
               }
             </div>
           
           <div className="SummaryVal">
             <div><h2>Summary B</h2></div>
               {
                 allSummaries[page-1][index][1]
              //  document['summary'+summarymodels[pair[1]]]
               }
             </div>
         </div>
         {criterias.map((criteria) => (
                       <div className="ratings">
                         <div className="ratingstext">
                             <h3>Please compare the two above summaries in regards to their {criteria}</h3>
                         </div>
                         <Slider  min={-2} max={2} marks={marks} step={null}  value={allScores[page-1][vs[index]][criteria]   || 0} disabled={true}/>
                         {/* <Slider  min={-2} max={2} marks={marks} step={null} onChange={(value) => setScore(value, criteria, pair)} defaultValue={0} /> */}
                       {/* <Slider  min={-2} max={2} marks={marks} step={null} onChange={criteriaChangeFunctions[criteria]} defaultValue={0} /> */}
                       </div>
               ))}
       </div>
         )
       }

      <Pagination simple onChange={onChange} defaultCurrent={1} total={allDialogueLines.length} pageSize={1} />


        </>:<></>}

    </div>
  );
}

export default PrevRated;