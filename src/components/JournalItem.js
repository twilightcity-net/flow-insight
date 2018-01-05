import React, { Component } from "react";
import moment from "moment";
import { Divider, Grid, Popup } from "semantic-ui-react";

//
// this component is the individual journal item entered in by the user
//
export default class JournalItem extends Component {
  constructor(props) {
    super(props);
    this.date = new Date(2017, 3, 7);
  }

  /// renders the component of the console view
  render() {
    const projectCell = (
      <div className="chunkTitle">{this.props.projectId}</div>
    );
    const taskCell = <div className="chunkTitle">{this.props.chunkId}</div>;
    const chunkCell = <div className="chunkText">{this.props.chunkText}</div>;
    const popupContent = (
      <div>
        <div>
          <i>{this.props.projectId}</i>
        </div>
        <div>
          <b>{this.props.chunkId}</b>
        </div>
        <Divider />
        <div>
          <span className="date">
            {moment(this.date).format("ddd, MMM Do 'YY, h:mm a")}
          </span>
        </div>
      </div>
    );

    return (
      <Grid.Row>
        <Grid.Column width={2}>
          <Popup
            trigger={projectCell}
            className="chunkTitle"
            content={popupContent}
            position="bottom left"
            inverted
            hideOnScroll
          />
        </Grid.Column>
        <Grid.Column width={2}>
          <Popup
            trigger={taskCell}
            className="chunkTitle"
            content={popupContent}
            position="bottom left"
            inverted
          />
        </Grid.Column>
        <Grid.Column width={12}>
          <Popup
            trigger={chunkCell}
            className="chunkTitle"
            content={popupContent}
            position="bottom left"
            inverted
          />
        </Grid.Column>
      </Grid.Row>
    );
  }
}
