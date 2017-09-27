import React, { Component } from 'react';
import logo from './logo.svg';
import './app.css';

const remote = window.require('electron').remote;
const appVersion = remote.app.getVersion();

class App extends Component {
  render() {
    return (
      <div className="app">
        <div className="app-header">
          <img src={logo} className="app-logo" alt="logo" />
          <h2>MetaOS Desktop Applicaton</h2>
        </div>
        <p className="app-intro">
          Version: {appVersion}
        </p>
        <p>
          Created by the Open Mastery Foundation.
        </p>
        <p>
          contact: <b><i>info@openmastery.org</i></b>
        </p>
      </div>
    );
  }
}

export default App;
