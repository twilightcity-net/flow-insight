import React, {Component} from "react";
import {Dropdown, Image} from "semantic-ui-react";

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
    this.lastOpened = null;
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
    this.isActionMenuOpen = true;
    document.getElementById(MontyButton.montyActionsPopupId).focus();
  }

  blurActionMenu() {
    console.log("blurActionMenu");
    this.isActionMenuOpen = false;
    document.getElementById(MontyButton.montyActionsPopupId).blur();
    document.getElementById(MontyButton.montyIcon).focus();
  }


  toggleActionMenu() {
    console.log("toggleActionMenu");

    if (!this.isActionMenuOpen) {
      this.lastOpened = window.performance.now();
    } else {
      this.lastOpened = null;
    }

    if (this.isActionMenuOpen) {
      this.blurActionMenu();
    } else {
      this.focusActionMenu();
    }
  }

  handleBlur = () => {
    console.log("handleBlurX");

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      const endTime = window.performance.now();
      let elapsed = null;
      if (this.lastOpened) {
        elapsed = endTime-this.lastOpened;
      }

      console.log("elapsed = "+elapsed);

      if (elapsed && elapsed > 200) {
        this.blurActionMenu();
      }
    }, 200);
  }

  onActionSelected() {
    console.log("toggleActionMenu");
  }

  /**
   * When we click on the Monty icon
   */
  onClickMonty = () => {
    if (this.props.isConsoleOpen ) {
      this.toggleActionMenu();
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
                  openOnFocus={true} closeOnBlur={true} onBlur={this.handleBlur}>
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
