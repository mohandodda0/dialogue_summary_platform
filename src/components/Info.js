import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import '../App.css';
import { Button } from 'antd';



function Info() {
  return (
    <div className="info">
        <div className="section">
            <h2>Goal</h2>
            <h4>SALT lab is using this tool for help gather dialogue summarization labeled data to better develop data to generate better dialogue summaries!</h4>
            <h4>For this we are looking at two directions: </h4>
            <p>1 Give salient information of the document</p>
            <p>2 Rate the summaries on 5 different aspects dialogue summary</p>

        </div>
        <div className="section">
            <h2>What is a good summary?</h2>
            <p> Roughly speaking, a good summary is a shorter piece of text that has the essence of the original. </p>
            <p>– tries to accomplish the same purpose and conveys the same information as the original post. </p>
            <p> In our case this is we are looking for dialogue summaries so we want the summaries to make sense within the context of a conversation!</p>
        </div>

        <div className="section">
            <h2>How to grade salient information?</h2>
            <p> In essence, we want you to highlight the important information of the document. </p>
            <p>This information you highlight needs to be that of which would be helpful in generating a summary.</p>
            <ul>
                <li>The information can be phrases, sentences, or a couple of words.</li>
                <li>Speakers’ <b>intents</b> should be included, if they can be clearly identified.</li>
                <li><b>Events/topics</b> in the conversation should be included, if they can be clearly identified</li>
                <li>The highlighted information could include important <b>discourse relations, particularly causal relations</b></li>
                <li>The highlighted information should include <b>important emotions</b> related to events in the summary if there are any.</li>
            </ul>
            <p>We want a minimum of 3 higlights and a maximum of 8 highlights per dialogue</p>
        </div>

        <div className="section">
            <h2>Rate Summaries on different Criteria</h2>
            <h4> After you have hilighted the salient information, we will give you 2 distinct summaries of the corresponding dialogue.</h4>
            <h4> We will have you compare the two summaries in different dimensions:</h4>
            <ol>
                <li>Coherence: Easy to understand and free of English errors.</li>
                <li>Accuracy: Information stated in the summary is accurate and has no incorrect information.</li>
                    <ul>
                        <li> It is not misleading</li>
                        <li>Doesn’t have much minor errors </li>
                    </ul>
                <li>Coverage: Mentions main information of the conversation. Convey the most salient information of the dialogue</li>
                <li>Concise: Summary is short and to the point. It doesn’t have too much fluff.  </li>
                <li>Overall Quality: What is your personal preference by the definition of a summary.</li>
            </ol>
            <p>We want a minimum of 3 higlights and a maximum of 8 highlights per dialogue</p>
        </div>
         <Link to="/">
            <Button type="primary" >
                    Start Grading!
            </Button>
        </Link>

    </div>
  );
}

export default Info;
