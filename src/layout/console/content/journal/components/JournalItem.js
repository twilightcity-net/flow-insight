import React, { Component } from "react";
import {
  Button,
  Divider,
  Grid,
  Icon,
  Image,
  Popup
} from "semantic-ui-react";
import { JournalClient } from "../../../../../clients/JournalClient";

/**
 * this component is the individual journal item entered in by the user
 */
export default class JournalItem extends Component {
  static get Status() {
    return {
      DONE: "done",
      ABORTED: "aborted"
    };
  }
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
  handleOnClickRow = () => {
    this.isActive = !this.isActive;
    this.forceUpdate(() => {
      this.props.onRowClick(this);
    });
  };

  /**
   * handle the user clicking the done button on the intention in the
   * journal which is represented as a green check mark.
   */
  handleClickDone = () => {
    JournalClient.finishIntention(
      this.props.model.id,
      JournalItem.Status.DONE,
      this,
      arg => {
        // TODO handle an error here, by calling a prop function from JournalResource
      }
    );
  };

  /**
   * handles the click event for when the user wishes to abort an intention
   */
  handleClickAbort = () => {
    JournalClient.finishIntention(
      this.props.model.id,
      JournalItem.Status.ABORTED,
      this,
      arg => {
        // TODO handle an error here, by calling a prop function from JournalResource
      }
    );
  };

  /**
   * determines what to render the finish status icon as by looking in
   * the model from the properties
   * @param model
   * @returns {*}
   */
  getFinishIcon(model) {
    let finishStatus = this.props.model.finishStatus;
    switch (finishStatus) {
      case JournalItem.Status.DONE:
        return this.getFinishStatusDoneContent();
      case JournalItem.Status.ABORTED:
        return this.getFinishStatusAbortContent();
      default:
        return this.getFinishStatusSelectorContent();
    }
  }

  /**
   * render the status finished as done with a green check mark
   * @returns {*}
   */
  getFinishStatusDoneContent() {
    return (
      <Icon.Group size="large" className="doneGreenDark">
        <Icon size="small" name="circle outline" />
        <Icon size="small" name="check" />
      </Icon.Group>
    );
  }

  /**
   * renders our finish abort status content for the intention
   * @returns {*}
   */
  getFinishStatusAbortContent() {
    return (
      <Icon
        size="small"
        name="close"
        className="abortRedDark"
      />
    );
  }

  /**
   * renders content for our finish and abort icon actions with
   * popups yay.
   * @returns {*}
   */
  getFinishStatusSelectorContent() {
    return (
      <span>
        <Popup
          trigger={
            <Icon.Group
              size="large"
              className="doneGreen"
              onClick={this.handleClickDone}
            >
              <Icon
                size="small"
                name="circle outline"
                link
              />
              <Icon size="small" name="check" link />
            </Icon.Group>
          }
          position="top center"
          content={
            <div className="doneGreen">
              Finished Intention
            </div>
          }
          inverted
          hideOnScroll
        />
      </span>
    );
  }

  /**
   * renders our gui for the popup information.
   * @returns {*}
   */
  getPopupContent() {
    let model = this.props.model;
    return (
      <div>
        <div>
          <i>{model.projectName}</i>
        </div>
        <div>
          <b>
            <span className="taskhighlight">
              {" "}
              {model.taskName}{" "}
            </span>
          </b>
        </div>
        <div>{model.taskSummary}</div>

        <Divider />
        <div>
          <span className="date">{model.position}</span>
        </div>
      </div>
    );
  }

  /**
   * renders our flame rating content block. This is a tensor rating
   * of -1  to 1 as a floating point. Adjusted to a whole number
   * scale for the gui through gridtime.
   * @returns {*}
   */
  getFlameBlockContent() {
    let flameRating = this.props.model.flameRating,
      imgYaySrc = "./assets/images/yay/16x16.png",
      imgWtfSrc = "./assets/images/wtf/16x16.png";

    if (flameRating > 0) {
      return (
        <span className="yayFlame">
          {flameRating}{" "}
          <Image src={imgYaySrc} verticalAlign="top" />
        </span>
      );
    } else if (flameRating < 0) {
      return (
        <span className="wtfFlame">
          {Math.abs(flameRating)}{" "}
          <Image src={imgWtfSrc} verticalAlign="middle" />
        </span>
      );
    }
  }

  /**
   * renders our
   * @returns {string|*}
   */
  getAbortCellContent() {
    let finishStatus = this.props.model.finishStatus;
    if (
      finishStatus !==
      (JournalItem.Status.DONE ||
        JournalItem.Status.ABORTED)
    ) {
      return (
        <Popup
          trigger={
            <Button
              icon="close"
              className="abortRed"
              onClick={this.handleClickAbort}
            />
          }
          position="top center"
          content={
            <div className="abortRed">Abort Intention</div>
          }
          inverted
          hideOnScroll
        />
      );
    } else {
      return "";
    }
  }

  /**
   * renders our jounrnal item in our grid for the console
   * @returns {*}
   */
  render() {
    let active = "";
    if (this.isActive) {
      active = "active";
    }

    let wtfPrefix = "";
    let wtfPopup = "";

    let linkedBlock = "";
    if (this.props.model.linked) {
      linkedBlock = (
        <Icon name="linkify" className="journalLink" />
      );
    }

    let taskStyle = "chunkTitle";
    let descriptionStyle = "chunkText";

    let projectCell = (
      <div className={taskStyle}>
        {this.props.model.projectName}
      </div>
    );
    let taskCell = (
      <div className={taskStyle}>
        {this.props.model.taskName}
        {linkedBlock}
      </div>
    );
    let chunkCell = (
      <div className={descriptionStyle}>
        {" "}
        <Popup
          trigger={wtfPrefix}
          content={wtfPopup}
          position="top center"
          inverted
          hideOnScroll
        />{" "}
        {this.props.model.description}
      </div>
    );

    let finishedCell = this.getFinishIcon();
    let abortCell = this.getAbortCellContent();
    let popupContent = this.getPopupContent();
    let flameBlock = this.getFlameBlockContent();

    return (
      <Grid.Row
        id={this.props.model.id}
        className={active}
        onClick={this.handleOnClickRow}
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
        <Grid.Column width={6} className="chunkCell">
          {chunkCell}
        </Grid.Column>
        <Grid.Column
          width={3}
          textAlign="center"
          verticalAlign="top"
          className="flameCell"
        >
          {flameBlock}
        </Grid.Column>
        <Grid.Column
          width={1}
          textAlign="right"
          verticalAlign="top"
          className="finishedCell"
        >
          {finishedCell}
        </Grid.Column>
        <Grid.Column
          width={1}
          textAlign="left"
          verticalAlign="top"
          className="abortCell"
        >
          {abortCell}
        </Grid.Column>
      </Grid.Row>
    );
  }
}
