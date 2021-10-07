import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  HashRouter
} from "react-router-dom";
import './App.css';
import Rate from './components/Rate';
import Welcome from './components/Welcome';
import Info from './components/Info';
import PrevRated from './components/PrevRated';
import { useHistory, useLocation } from "react-router-dom";
import { Menu } from 'antd';


function App() {
  let [nameSet, setNameSet] = useState(false)


  // let location = useLocation()

  let handleClick = e => {
    console.log('click ', e);
    // this.setState({ current: e.key });
    // console.log(location.pathname.replace("/", ""))
  };


  useEffect(() => {
    if (localStorage.getItem("name")) {
      setNameSet(true)
    }
  }, []);


  return (
    <div className="App">
      <HashRouter>
        <div>
          <nav>
          <Menu onClick={handleClick}   mode="horizontal">
            <Menu.Item key="welcome"><Link to="/"> Set Name </Link></Menu.Item>
            <Menu.Item key="rate" disabled={!nameSet}><Link to="/rate"> Rate Summaries </Link></Menu.Item>
            <Menu.Item key="info"><Link to="/info">Information about Grading </Link></Menu.Item>
            <Menu.Item key="prevrated" disabled={!nameSet}><Link to="/prevrated">Previously Rated</Link></Menu.Item>
            {/* <SubMenu title="SubMenu">
              <Menu.Item>SubMenuItem</Menu.Item>
            </SubMenu> */}
          </Menu>
          </nav>

          <Switch>
            <Route path="/info">
              <Info />
            </Route>
            <Route path="/rate">
              <Rate />
            </Route>
            <Route path="/prevrated">
              <PrevRated />
            </Route>
            <Route path="/">
              <Welcome setNameSet={setNameSet}/>
            </Route>
          </Switch>
        </div>
      </HashRouter>      
    </div>
  );
}

export default App;
