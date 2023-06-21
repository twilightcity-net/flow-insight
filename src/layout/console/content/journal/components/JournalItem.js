import React, { Component } from "react";
import {
  Button,
  Divider,
  Grid,
  Icon,
  Image,
  Popup,
} from "semantic-ui-react";
import { JournalClient } from "../../../../../clients/JournalClient";
import { error } from "electron-log";
import { MemberClient } from "../../../../../clients/MemberClient";
import UtilRenderer from "../../../../../UtilRenderer";

/**
 * this component is the individual journal item entered in by the user
 */
export default class JournalItem extends Component {
  static get Status() {
    return {
      DONE: "done",
      ABORTED: "aborted",
    };
  }
  /**
   * builds our journal item for our console
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[JournalItem]";
    this.props.pusher(this);
    this.state = {
      isActive: false,
      flameRating: props.model.flameRating,
      isLinked: props.model.linked,
    };
  }

  /**
   * Updates the state of the journal item, could be a state update for a flame override,
   * or could be a props update for a talk message update that updated this particular entry.
   * For a props update, set the flame update state back to what's in the props.
   *
   * For a state update, do nothing special.
   * @param prevProps
   * @param prevState
   * @param snapshot
   */
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.model.flameRating !==
      this.props.model.flameRating
    ) {
      this.setState({
        flameRating: this.props.model.flameRating,
      });
    }
  }

  /**
   * handles clicking on our journal item. toggels its active state and called function
   * handler in parent component, by passing this component into parent function
   */
  handleOnClickRow = () => {
    this.props.onRowClick(this);
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
      (arg) => {
        if (arg.error) {
          throw new error(arg.error);
        }
        this.props.onFinishIntention(this, arg);
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
      (arg) => {
        if (arg.error) {
          throw new error(arg.error);
        }
        this.props.onAbortIntention(this, arg);
      }
    );
  };

  /**
   * renders our project cell in the grid.
   * @returns {*}
   */
  getProjectCellContent() {
    return (
      <div className="chunkTitle">
        {this.props.model.projectName}
      </div>
    );
  }

  /**
   * renders our task cell in our grid of journal items
   * @returns {*}
   */
  getTaskCellContent() {
    return (
      <div className="chunkTitle">
        {this.props.model.taskName}
        {this.state.isLinked && (
          <Icon name="linkify" className="journalLink" />
        )}
      </div>
    );
  }

  /**
   * renders our chunk cell that contains our journal intention's
   * description.
   * @returns {*}
   */
  getChunkCellContent() {
    return (
      <div className="chunkText">
        {this.props.model.description}
      </div>
    );
  }

  /**
   * determines what to render the finish status icon as by looking in
   * the model from the properties
   * @returns {*}
   */
  getFinishIcon() {
    let finishStatus = this.props.model.finishStatus,
      username = this.props.model.username;

    if (this.props.isDoneRow) {
      return this.getFinishStatusTaskDoneContent();
    }

    switch (finishStatus) {
      case JournalItem.Status.DONE:
        return this.getFinishStatusDoneContent();
      case JournalItem.Status.ABORTED:
        return this.getFinishStatusAbortContent();
      default:
        if (username === MemberClient.me.username) {
          return this.getFinishStatusSelectorContent();
        } else {
          return this.getUnfinishedStatusContent();
        }
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
   * render the status finished as done with a green check mark
   * @returns {*}
   */
  getFinishStatusTaskDoneContent() {
    return (
      <Icon.Group size="large" className="donePurple">
        <Icon size="small" name="star" />
      </Icon.Group>
    );
  }

  /**
   * renders our cell content for when the condiion is
   * for an intention that is yet to be completed or
   * is aborted.
   * @returns {*}
   */
  getUnfinishedStatusContent() {
    return (
      <Icon.Group size="large" className="doneGreenDark">
        <Icon size="small" name="circle outline" />
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
        className="abortRed"
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
              Finish Intention
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
      <div className="journalPopup">
        <div className="title">
          <b>
            <span className="taskhighlight">
              {" "}
              {model.taskName}{" "}
            </span>
          </b>
        </div>
        <div>
          <i>{model.projectName}</i>
        </div>
        <div>{model.taskSummary}</div>

        <Divider />
        <div>
          <span className="date">
            {UtilRenderer.getJournalTimeString(
              model.position
            )}
          </span>
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
    let flameRating = this.state.flameRating,
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
   * renders our abort cell for our journal grid in the gui
   * @returns {string|*}
   */
  getAbortCellContent() {
    if (this.props.isDoneRow) return "";

    let finishStatus = this.props.model.finishStatus;
    if (
      !(
        finishStatus === JournalItem.Status.DONE ||
        finishStatus === JournalItem.Status.ABORTED
      ) &&
      this.props.model.username === MemberClient.me.username
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
    let active = this.props.isActiveRow ? "active" : "",
      projectCell = this.getProjectCellContent(),
      taskCell = this.getTaskCellContent(),
      chunkCell = this.getChunkCellContent(),
      finishedCell = this.getFinishIcon(),
      abortCell = this.getAbortCellContent(),
      popupContent = this.getPopupContent(),
      flameBlock = this.getFlameBlockContent();

    return (
      <Grid.Row
        id={this.props.model.id}
        className={active}
        onClick={this.handleOnClickRow}
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
        <Grid.Column width={3}>
          <Popup
            trigger={taskCell}
            className="chunkTitle"
            content={popupContent}
            position="bottom left"
            inverted
          />
        </Grid.Column>
        <Grid.Column width={7} className="chunkCell">
          {chunkCell}
        </Grid.Column>
        <Grid.Column
          width={2}
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
