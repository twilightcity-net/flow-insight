import React, { Component } from "react";
import { Grid } from "semantic-ui-react";
import JournalItem from "./JournalItem";

const {remote} = window.require("electron");

const electronLog = remote.require("electron-log");


//
// this component is the tab panel wrapper for the console content
//
export default class JournalItems extends Component {

  constructor(props) {

    super(props);

    this.state = {
      journalItems: []
    };

  }

  log = msg => {
    electronLog.info(`[${this.constructor.name}] ${msg}`);
  };

  componentWillReceiveProps = (nextProps) => {
    this.log("JournalItems:: componentWillReceiveProps");

    this.log("intentions = "+ nextProps.intentions);

    let intentions = nextProps.intentions;

    var journalItems = [];
    for (var i in intentions) {
      journalItems[i] = {
        projectName: intentions[i].projectName,
        taskName: intentions[i].taskName,
        description: intentions[i].description,
      };
    }

    this.setState({
      journalItems: journalItems
    });

  };

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  }

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  /// renders the journal items component from array in the console view
  render() {
    return (
      <div
        id="component"
        className="journalItems"
        style={{ height: this.props.height }}
      >
        <Grid inverted>
          {this.state.journalItems.map(d =>
            <JournalItem
              projectName={d.projectName}
              taskName={d.taskName}
              description={d.description}
            />
          )}
        </Grid>
        <div style={{ float:"left", clear: "both" }}
             ref={(el) => { this.messagesEnd = el; }}>
        </div>
      </div>
    );
  }
}

