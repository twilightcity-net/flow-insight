import React, { Component } from "react";
import { Grid } from "semantic-ui-react";

/**
 * this component is the intentions header for the FlowMap intentions
 */
export default class IntentionsHeader extends Component {
  /**
   * builds our flow map intention header
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[IntentionsHeader]";
    this.state = {};
  }

  /**
   * renders our headers
   * @returns {*}
   */
  render() {

    let taskColumn = "";
    let intentionColumn = "";
    if (this.props.hasTaskColumn) {
      taskColumn = (
        <Grid.Column width={3}>
        <div className="chunkTitle">Task</div>
      </Grid.Column>);
      intentionColumn = (
        <Grid.Column width={11}>
          <div className="chunkTitle">Intention</div>
        </Grid.Column>
      );
    } else {
      intentionColumn = (
        <Grid.Column width={14}>
          <div className="chunkTitle">Intention</div>
        </Grid.Column>
      );
    }


    return (
      <Grid.Row className="intentionHeaderRow">
        <Grid.Column width={2}>
          <div className="chunkTitle">Time (hh:mm)</div>
        </Grid.Column>
        {taskColumn}
        {intentionColumn}
      </Grid.Row>
    );
  }
}
