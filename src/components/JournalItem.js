import React, { Component } from "react";
import { Grid, Popup } from "semantic-ui-react";

//
// this component is the individual journal item entered in by the user
//
export default class JournalItem extends Component {
  // constructor(props) {
  //   super(props);
  // }

  /// renders the component of the console view
  render() {
    return (
      <Grid.Row>
        <Grid.Column width={2}>
          <Popup
            trigger={<div className="chunkTitle">{this.props.projectId}</div>}
            className="chunkTitle"
            content={
              <div>
                <div>
                  <i>{this.props.projectId}</i>
                </div>
                <div>
                  <b>{this.props.chunkId}</b>
                </div>
              </div>
            }
            position="bottom left"
            on="hover"
            inverted
          />
        </Grid.Column>
        <Grid.Column width={2}>
          <Popup
            trigger={<div className="chunkTitle">{this.props.chunkId}</div>}
            className="chunkTitle"
            content={
              <div>
                <div>
                  <i>{this.props.projectId}</i>
                </div>
                <div>
                  <b>{this.props.chunkId}</b>
                </div>
              </div>
            }
            position="bottom left"
            on="hover"
            inverted
          />
        </Grid.Column>
        <Grid.Column width={12}>
          <div className="chunkText">{this.props.chunkText}</div>
        </Grid.Column>
      </Grid.Row>
    );
  }
}
