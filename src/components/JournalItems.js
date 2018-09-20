import React, { Component } from "react";
import { Grid } from "semantic-ui-react";
import JournalItem from "./JournalItem";
import moment from "moment";

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

      let d = intentions[i].position;
      let dateObj = new Date(d[0], d[1], d[2], d[3], d[4], d[5]);

      journalItems[i] = {
        projectName: intentions[i].projectName,
        taskName: intentions[i].taskName,
        taskSummary: intentions[i].taskSummary,
        description: intentions[i].description,
        position: moment(dateObj).format("ddd, MMM Do 'YY, h:mm a")
      };
    }

    this.setState({
      journalItems: journalItems
    });

  };

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  };

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
              taskSummary={d.taskSummary}
              description={d.description}
              position={d.position}
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

