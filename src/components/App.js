import React, { Component } from "react";
import { Tab } from "react-bootstrap";
import TopNav from "./TopNav.js";
import Snipping from "./Snipping.js";
import "./App.css";

class App extends Component {
  render() {
    return (
      <div
        style={{
          backgroundImage: "url('./bga.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 100%",
          width: "100%",
          height: "100%",
          overflow: "auto",
        }}
      >
        <TopNav />

        <Tab.Container id="left-tabs-example" defaultActiveKey="first">
          <div
            style={{ width: "100%", marginRight: "-16px", marginLeft: "-16px" }}
          >
            <Snipping />
          </div>
        </Tab.Container>
      </div>
    );
  }
}
export default App;
