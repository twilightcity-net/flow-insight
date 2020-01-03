import React, {Component} from "react";
import {Divider, Grid, Icon, Image, Popup} from "semantic-ui-react";

/**
 * this component is the individual journal item entered in by the user
 */

// FIXME this component needs be have almost no logic because it is replicated in a map

export default class JournalItem extends Component {
  constructor(props) {
    super(props);

    this.name = "[JournalItem]";
  }

  selectRow(rowId, journalItem) {
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
    console.log(this.name + " - gotoCircle!!! " + this.props.circleId);
  };

  /// renders the component of the console view
  render() {
    let finishIcon = "";
    if (this.props.finishStatus === "done") {
      finishIcon = <Icon name="check" className="doneGreenDark"/>;
    }
    else if (this.props.finishStatus === "aborted") {
      finishIcon = <Icon name="close" className="doneRed"/>;
    }
    else if (this.props.isMyJournal) {
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
    let wtfPopup = "";
    let padding = "";
    if (this.props.journalEntryType === "WTF") {
      wtfPrefix = (
        <span className="circleLink" onClick={this.gotoCircle}>
          WTF?
        </span>
      );

      if (
        this.props.finishStatus === "aborted" ||
        this.props.finishStatus === "done"
      ) {
        wtfPopup = (
          <div>
            <div>
              <span className="alarm">
                {" "}
                <i>Circle Closed</i>
              </span>
            </div>
          </div>
        );
      }
      else {
        wtfPopup = (
          <div>
            <div>
              <span className="alarm">
                {" "}
                <i>Click to Join!</i>
              </span>
            </div>
          </div>
        );
      }

      padding = <span>&nbsp;&nbsp;</span>;
    }

    let linkedBlock = "";
    if (this.props.linked) {
      linkedBlock = <Icon name="linkify" className="journalLink"/>;
    }

    let taskStyle = "chunkTitle";
    let descriptionStyle = "chunkText";

    const projectCell = (
      <div className={taskStyle}>{this.props.projectName}</div>
    );
    const taskCell = (
      <div className={taskStyle}>
        {this.props.taskName}
        {linkedBlock}
      </div>
    );
    const chunkCell = (
      <div className={descriptionStyle}>
        {padding}
        {padding}
        <Popup
          trigger={wtfPrefix}
          content={wtfPopup}
          position="top center"
          inverted
          hideOnScroll
        />

        {padding}

        {this.props.description}
        {finishIcon}
      </div>
    );

    const popupContent = (
      <div>
        <div>
          <i>{this.props.projectName}</i>
        </div>
        <div>
          <b>
            <span className="taskhighlight"> {this.props.taskName} </span>
          </b>
        </div>
        <div>{this.props.taskSummary}</div>

        <Divider/>
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
          <Image src="./assets/images/yay/16x16.png" verticalAlign="top"/>
        </span>
      );
    }
    else if (flameRating < 0) {
      flameBlock = (
        <span className="wtfFlame">
          {Math.abs(flameRating)}{" "}
          <Image src="./assets/images/wtf/16x16.png" verticalAlign="middle"/>
        </span>
      );
    }

    return (
      <Grid.Row
        id={this.props.id}
        className={active}
        onClick={() => this.selectRow(this.props.id, this.props.journalItem)}
      >
        <Grid.Column width={3}>
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
        <Grid.Column width={9} className="chunkCell">
          {chunkCell}
        </Grid.Column>
        <Grid.Column width={1} className="chunkTitle">
          {flameBlock}
        </Grid.Column>
      </Grid.Row>
    );
  }
}
