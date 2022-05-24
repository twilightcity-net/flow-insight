import React, {Component} from "react";
import {Dropdown, Image, TextArea} from "semantic-ui-react";

/**
 * this component is for the Monty app action button that starts/pauses the moovies
 */
export default class MontyButton extends Component {

  static montyActionsPopupId = "montyActionsPopup";
  static montyIcon = "montyIcon";

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
  }

  onClickPause = () => {
    console.log("onClickPause!");
  }

  onClickResume = () => {
    console.log("onClickResume!");
  }

  onClickStartOver = () => {
    console.log("onClickStartOver!");
  }

  onClickExit = () => {
    console.log("onClickExit!");
    this.props.onMontyExit();
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
            <Dropdown.Item icon="play" text='Start Moovie' onClick={this.onClickPlay} />
            <Dropdown.Item icon="pause circle outline" disabled={true} text='Pause' onClick={this.onClickPause} />
            <Dropdown.Item icon="play circle outline" disabled={true} text='Resume' onClick={this.onClickResume}/>
            <Dropdown.Item icon="redo" disabled={true} text='Start Over' onClick={this.onClickStartOver}/>
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
