import React, { Component } from "react";
import {Divider, Grid, Image, Popup} from "semantic-ui-react";

const {remote} = window.require("electron");

const electronLog = remote.require("electron-log");

//
// this component is the individual journal item entered in by the user
//
export default class JournalItem extends Component {

  log = msg => {
    electronLog.info(`[${this.constructor.name}] ${msg}`);
  };

  selectRow(rowId, journalItem) {
    let rowObj = document.getElementById(rowId);

    this.props.onSetActiveRow(rowId, rowObj, journalItem);
  }

  /// renders the component of the console view
  render() {
    const projectCell = (
      <div className="chunkTitle">{this.props.projectName}</div>
    );
    const taskCell = <div className="chunkTitle">{this.props.taskName}</div>;
    const chunkCell = <div className="chunkText">{this.props.description}</div>;
    const popupContent = (
      <div>
        <div>
          <i>{this.props.projectName}</i>
        </div>
        <div>
          <b>{this.props.taskName} </b>
        </div>
        <div>
          {this.props.taskSummary}
        </div>

        <Divider />
        <div>
          <span className="date">
            {this.props.position}
          </span>
        </div>
      </div>
    );

    let flameBlock = "";

    if (this.props.flameRating > 0) {
      flameBlock = <span className="yayFlame">{this.props.flameRating} <Image src="./assets/images/yay/16x16.png"  verticalAlign='top' /></span>;
    } else if (this.props.flameRating < 0) {
      flameBlock = <span className="wtfFlame">{Math.abs(this.props.flameRating)} <Image src="./assets/images/wtf/16x16.png"  verticalAlign='middle' /></span>;
    }

    return (


      <Grid.Row id={this.props.id} onClick={() => this.selectRow(this.props.id, this.props.journalItem)}>
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
        <Grid.Column width={1} className="chunkTitle" >
          {flameBlock}
        </Grid.Column>

        <Grid.Column width={9}>
          {chunkCell}
        </Grid.Column>
      </Grid.Row>
    );
  }
}
