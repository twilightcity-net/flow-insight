import React, {Component} from "react";
import {Dropdown, Image} from "semantic-ui-react";
import FervieProfile from "../shared/FervieProfile";
import {MemberClient} from "../../clients/MemberClient";

/**
 * this component is for the Fervie dm app action button that allows exiting the window
 */
export default class FervieButton extends Component {

  static fervieActionsPopupId = "fervieActionsPopup";
  static fervieIcon = "fervieIcon";


  /**
   * Initialize the layout
   */
  constructor(props) {
    super(props);
    this.name = "[FervieButton]";

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
    document.getElementById(FervieButton.fervieActionsPopupId).focus();
  }

  blurActionMenu() {
    this.isActionMenuOpen = false;
    document.getElementById(FervieButton.fervieActionsPopupId).blur();
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

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      const endTime = window.performance.now();
      let elapsed = null;
      if (this.lastOpened) {
        elapsed = endTime-this.lastOpened;
      }

      console.log("elapsed = "+elapsed);

      if (elapsed && elapsed > 400) {
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
  onClickFervie = () => {
    if (this.props.isConsoleOpen ) {
      this.toggleActionMenu();
    }

    this.props.onClickFervie();
  }

  onClickExit = () => {
    console.log("onClickExit!");
    this.props.onFervieExit();
  }

  onClickClearChat = () => {
    console.log("onClickClearChat");
  }

  isClearChatDisabled = () => {
    return false;
  }
  /**
   * renders the root console layout of the monty action button view
   * @returns {*} - the JSX to render
   */
  render() {

    const fervieMe = <FervieProfile showPopup={false} hasBuddyActions={false} isBuddy={false} circuitMember={MemberClient.me} hasBorder={true} />
    const fervieMember = <FervieProfile showPopup={false} hasBuddyActions={false} isBuddy={false} circuitMember={this.props.member} hasBorder={true} />;

    return (
      <div>
        <Dropdown id={FervieButton.fervieActionsPopupId} text=""
                  openOnFocus={true} closeOnBlur={true} onBlur={this.handleBlur}>
          <Dropdown.Menu>
            <Dropdown.Item icon="redo" disabled={this.isClearChatDisabled()} text='Clear Chat' onClick={this.onClickClearChat}/>
            <Dropdown.Divider />
            <Dropdown.Item text='Exit' onClick={this.onClickExit} />
          </Dropdown.Menu>
        </Dropdown>
           <div className={"appIcon fervieMe"} onClick={this.onClickFervie}>
             {fervieMe}
           </div>
        <div className={"appIcon fervieMember"} onClick={this.onClickFervie}>
          {fervieMember}
        </div>
      </div>
        );

  }
}
