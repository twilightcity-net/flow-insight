import React, { Component } from "react";
import { Divider, Grid, Image, Popup, Icon } from "semantic-ui-react";

const { remote } = window.require("electron");
const electronLog = remote.require("electron-log");

//
// this component is the individual journal item entered in by the user
//
export default class JournalItem extends Component {
  log = msg => {
    electronLog.info(`[${this.constructor.name}] ${msg}`);
  };

  selectRow(rowId, journalItem) {
    console.log("selectRow!!!");
    let rowObj = document.getElementById(rowId);

    this.props.onSetActiveRow(rowId, rowObj, journalItem);
  }

  handleClickForDone = () => {
    this.handleUpdateFinishStatus("done");
  };

  handleClickForAbort = () => {
    this.handleUpdateFinishStatus("aborted");
  };

  handleUpdateFinishStatus = finishStatus => {
    this.props.journalItem.finishStatus = finishStatus;
    this.props.onUpdateFinishStatus(this.props.journalItem, finishStatus);
  };

  gotoCircle = () => {
    console.log("gotoCircle!!! " + this.props.circleId);
  };

  /// renders the component of the console view
  render() {
    let finishIcon = "";
    if (this.props.finishStatus === "done") {
      finishIcon = <Icon name="check" className="doneGreenDark" />;
    } else if (this.props.finishStatus === "aborted") {
      finishIcon = <Icon name="close" className="doneRed" />;
    } else {
      finishIcon = (
        <span>
          {" "}
          <Popup
            trigger={
              <Icon
                link
                name="check"
                className="doneGreen"
                onClick={this.handleClickForDone}
              />
            }
            content={<div className="doneGreen">Finish</div>}
            inverted
            hideOnScroll
          />
          <Popup
            trigger={
              <Icon
                link
                name="close"
                color="red"
                onClick={this.handleClickForAbort}
              />
            }
            content={<div className="doneRed">Abort</div>}
            inverted
            hideOnScroll
          />
        </span>
      );
    }

    if (this.props.circleId) {
      finishIcon = "";
    }

    let active = "";
    if (this.props.isActive) {
      active = "active";
    }

    let wtfPrefix = "";
    let padding = "";
    if (this.props.journalEntryType === "WTF") {
      wtfPrefix = (
        <span className="circleLink" onClick={this.gotoCircle}>
          WTF?
        </span>
      );
      padding = <span>&nbsp;&nbsp;</span>;
    }

    let taskStyle = "chunkTitle";
    if (this.props.circleId != null) {
      taskStyle = " alarm";
    }

    let descriptionStyle = "chunkText";
    if (this.props.circleId != null) {
      descriptionStyle = " alarmDetails";
    }

    const projectCell = (
      <div className={taskStyle}>{this.props.projectName}</div>
    );
    const taskCell = <div className={taskStyle}>{this.props.taskName}</div>;
    const chunkCell = (
      <div className={descriptionStyle}>
        {wtfPrefix}
        {padding}

        {this.props.description}
        {finishIcon}
      </div>
    );

    let popupStyle = "taskhighlight";
    if (this.props.circleId != null) {
      popupStyle = " alarm";
    }

    const popupContent = (
      <div>
        <div>
          <i>{this.props.projectName}</i>
        </div>
        <div>
          <b>
            <span className={popupStyle}> {this.props.taskName} </span>
          </b>
        </div>
        <div>{this.props.taskSummary}</div>

        <Divider />
        <div>
          <span className="date">{this.props.position}</span>
        </div>
      </div>
    );

    let flameBlock = "";

    let flameRating = this.props.flameRating;

    if (this.props.dirtyFlame != null) {
      flameRating = this.props.dirtyFlame;
    }

    if (flameRating > 0) {
      flameBlock = (
        <span className="yayFlame">
          {flameRating}{" "}
          <Image src="./assets/images/yay/16x16.png" verticalAlign="top" />
        </span>
      );
    } else if (flameRating < 0) {
      flameBlock = (
        <span className="wtfFlame">
          {Math.abs(flameRating)}{" "}
          <Image src="./assets/images/wtf/16x16.png" verticalAlign="middle" />
        </span>
      );
    }

    return (
      <Grid.Row
        id={this.props.id}
        className={active}
        onClick={() => this.selectRow(this.props.id, this.props.journalItem)}
      >
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
        <Grid.Column width={1} className="chunkTitle">
          {flameBlock}
        </Grid.Column>

        <Grid.Column width={9}>{chunkCell}</Grid.Column>
      </Grid.Row>
    );
  }
}
