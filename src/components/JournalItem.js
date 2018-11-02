import React, { Component } from "react";
import {Button, Divider, Grid, Image, Popup, Icon} from "semantic-ui-react";

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

  //entry needs to have a status as to whether it's done safely or aborted, need finish time
  //then done/aborted flag in DB, then return this in the journal items

  //then checkmarks appear if status is closed, safely needs to be added to the saving of intentions

  //get the last intention, save the checkmark of the last intention if it's not aborted

  handleClickForDone = () => {
    this.log("donE");
    this.handleUpdateFinishStatus("done");
  };

  handleClickForAbort = () => {
    this.log("abort");

    this.handleUpdateFinishStatus("aborted");

  };

  handleUpdateFinishStatus = (finishStatus) => {
    this.props.journalItem.finishStatus = finishStatus;
    this.props.onUpdateFinishStatus(this.props.journalItem, finishStatus);
  };

  /// renders the component of the console view
  render() {

    let finishIcon = "";
    if (this.props.finishStatus == 'done') {
      finishIcon = <Icon name='check' color='doneGreen'/>;
    } else if (this.props.finishStatus === 'aborted') {
      finishIcon = <Icon name='close' color='red'/>;
    } else {
      finishIcon = <span><Icon link name='check' color='doneGreen' onClick={this.handleClickForDone}/>
        <Icon link name='close' color='red' onClick={this.handleClickForAbort}/></span>
    }


    const projectCell = (
      <div className="chunkTitle">{this.props.projectName}</div>
    );
    const taskCell = <div className="chunkTitle">{this.props.taskName}</div>;
    const chunkCell = <div className="chunkText">{this.props.description}
      {finishIcon}
    </div>;
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
