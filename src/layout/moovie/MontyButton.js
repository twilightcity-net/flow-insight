import React, {Component} from "react";
import {Dropdown, Image, TextArea} from "semantic-ui-react";

/**
 * this component is for the Monty app action button that starts/pauses the moovies
 */
export default class MontyButton extends Component {

  static montyActionsPopupId = "montyActionsPopup";
  static montyIcon = "montyIcon";

  static get MoovieState() {
    return {
      OPEN: "OPEN",
      STARTED: "STARTED",
      PAUSED: "PAUSED",
      CLOSED: "CLOSED"
    }
  }

  /**
   * Initialize the layout
   */
  constructor(props) {
    super(props);
    this.name = "[MontyButton]";

    this.state = {
    };
  }

  /**
   * Called when the chat console is first loaded
   */
  componentDidMount = () => {
  };

  /**
   * called right before when the component will unmount
   */
  componentWillUnmount = () => {
  };


  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.isConsoleOpen && !this.props.isConsoleOpen) {
      console.log("Console was closed blurring!");
      this.isActionMenuOpen = false;
    }
  }

  /**
   * Shows the popup action menu for Monty
   */
  focusActionMenu() {
    console.log("focusActionMenu");
    document.getElementById(MontyButton.montyActionsPopupId).focus();
  }

  blurActionMenu() {
    console.log("blurActionMenu");
    document.getElementById(MontyButton.montyActionsPopupId).blur();
    document.getElementById(MontyButton.montyIcon).focus();
  }

  onActionSelected() {
    console.log("toggleActionMenu");
  }

  /**
   * When we click on the Monty icon
   */
  onClickMonty = () => {
    if (this.props.isConsoleOpen ) {
      this.focusActionMenu();
    }

    this.props.onClickMonty();
  }

  onClickPlay = () => {
    console.log("onClickPlay!");
    this.props.onStartMoovie();
  }

  onClickPause = () => {
    console.log("onClickPause!");
    this.props.onPauseMoovie();
  }

  onClickResume = () => {
    console.log("onClickResume!");
    this.props.onResumeMoovie();
  }

  onClickStartOver = () => {
    console.log("onClickStartOver!");
    this.props.onRestartMoovie();
  }

  onClickExit = () => {
    console.log("onClickExit!");
    this.props.onMontyExit();
  }

  isPlayDisabled = () => {
    return !(this.props.moovie && this.props.moovie.circuitState === MontyButton.MoovieState.OPEN);
  }

  isPauseDisabled = () => {
    return !(this.props.moovie && this.props.moovie.circuitState === MontyButton.MoovieState.STARTED);
  }

  isResumeDisabled = () => {
    return !(this.props.moovie && this.props.moovie.circuitState === MontyButton.MoovieState.PAUSED);
  }

  isStartOverDisabled = () => {
    return !(this.props.moovie && this.props.moovie.circuitState === MontyButton.MoovieState.PAUSED);
  }

  /**
   * renders the root console layout of the monty action button view
   * @returns {*} - the JSX to render
   */
  render() {
    return (
      <div>
        <Dropdown id={MontyButton.montyActionsPopupId} text=""
                  openOnFocus={true} closeOnBlur={true} >
          <Dropdown.Menu>
            <Dropdown.Item icon="play" text='Start Moovie' disabled={this.isPlayDisabled()} onClick={this.onClickPlay} />
            <Dropdown.Item icon="pause circle outline" disabled={this.isPauseDisabled()} text='Pause' onClick={this.onClickPause} />
            <Dropdown.Item icon="play circle outline" disabled={this.isResumeDisabled()} text='Resume' onClick={this.onClickResume}/>
            <Dropdown.Item icon="redo" disabled={this.isStartOverDisabled()} text='Start Over' onClick={this.onClickStartOver}/>
            <Dropdown.Divider />
            <Dropdown.Item text='Exit' onClick={this.onClickExit} />
          </Dropdown.Menu>
        </Dropdown>
           <Image id="montyIcon"
                 src={"./assets/animation/monty/monty_icon.png"}
                 className="monty"
                 onClick={this.onClickMonty}/>

      </div>
        );

  }
}
