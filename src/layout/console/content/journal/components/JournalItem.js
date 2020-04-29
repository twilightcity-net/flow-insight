import React, { Component } from "react";
import {
  Divider,
  Grid,
  Icon,
  Image,
  Popup
} from "semantic-ui-react";

/**
 * this component is the individual journal item entered in by the user
 */
export default class JournalItem extends Component {
  /**
   * builds our journal item for our console
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[JournalItem]";
    this.isActive = false;
  }

  /**
   * handles clicking on our journal item. toggels its active state and called function
   * handler in parent component, by passing this component into parent funciton
   */
  handleRowClick = () => {
    this.isActive = !this.isActive;
    this.forceUpdate(() => {
      this.props.onRowClick(this);
    });
  };

  handleClickForDone = () => {
    this.handleUpdateFinishStatus("done");
  };

  handleClickForAbort = () => {
    this.handleUpdateFinishStatus("aborted");
  };

  handleUpdateFinishStatus = finishStatus => {
    this.props.journalItem.finishStatus = finishStatus;
    this.props.onUpdateFinishStatus(
      this.props.journalItem,
      finishStatus
    );
  };

  /**
   * this is used for something, i dont know what yet.
   * @returns {null}
   */
  getEffectiveDirtyFlame() {
    // TODO this.props.id  // how dirty is our flame? We just don't know for sure.
    return null;
  }

  /**
   * renders our jounrnal item in our grid for the console
   * @returns {*}
   */
  render() {
    let finishIcon = "";
    if (this.props.finishStatus === "done") {
      finishIcon = (
        <Icon name="check" className="doneGreenDark" />
      );
    } else if (this.props.finishStatus === "aborted") {
      finishIcon = (
        <Icon name="close" className="doneRed" />
      );
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
            content={
              <div className="doneGreen">Finish</div>
            }
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
    if (this.isActive) {
      active = "active";
    }

    let wtfPrefix = "";
    let wtfPopup = "";
    let padding = "";

    let linkedBlock = "";
    if (this.props.linked) {
      linkedBlock = (
        <Icon name="linkify" className="journalLink" />
      );
    }

    let taskStyle = "chunkTitle";
    let descriptionStyle = "chunkText";

    const projectCell = (
      <div className={taskStyle}>
        {this.props.projectName}
      </div>
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
            <span className="taskhighlight">
              {" "}
              {this.props.taskName}{" "}
            </span>
          </b>
        </div>
        <div>{this.props.taskSummary}</div>

        <Divider />
        <div>
          <span className="date">
            {this.props.position}
          </span>
        </div>
      </div>
    );

    let flameBlock = "";

    let flameRating = this.props.flameRating;

    if (this.getEffectiveDirtyFlame() != null) {
      flameRating = this.getEffectiveDirtyFlame();
    }

    if (flameRating > 0) {
      flameBlock = (
        <span className="yayFlame">
          {flameRating}{" "}
          <Image
            src="./assets/images/yay/16x16.png"
            verticalAlign="top"
          />
        </span>
      );
    } else if (flameRating < 0) {
      flameBlock = (
        <span className="wtfFlame">
          {Math.abs(flameRating)}{" "}
          <Image
            src="./assets/images/wtf/16x16.png"
            verticalAlign="middle"
          />
        </span>
      );
    }

    return (
      <Grid.Row
        id={this.props.model.id}
        className={active}
        onClick={this.handleRowClick}
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
        <Grid.Column width={2} className="chunkTitle">
          {flameBlock}
        </Grid.Column>
      </Grid.Row>
    );
  }
}
