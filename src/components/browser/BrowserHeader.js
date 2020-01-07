import React, { Component } from "react";
import {
  Button,
  Dropdown,
  Grid,
  Icon,
  Input,
  Segment
} from "semantic-ui-react";
import { ActiveViewControllerFactory } from "../../controllers/ActiveViewControllerFactory";
import { DataModelFactory } from "../../models/DataModelFactory";
import { MainPanelViewController } from "../../controllers/MainPanelViewController";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class BrowserHeader extends Component {
  /**
   * the constructor for the array of journal items to display
   * @param props - the components properties
   */
  constructor(props) {
    super(props);
    this.name = "[BrowserHeader]";
    this.state = {
      disableControls: false,
      location: ""
    };
    this.myController = ActiveViewControllerFactory.createViewController(
      ActiveViewControllerFactory.Views.BROWSER_PANEL,
      this
    );
    this.teamModel = DataModelFactory.createModel(
      DataModelFactory.Models.MEMBER_STATUS
    );
  }

  /**
   * gets hardcoded array of actions used by the dropdown in the browser
   * @returns {({text: string, value: string, key: number}|{text: string, value: string, key: number}|{text: string, value: string, key: number}|{text: string, value: string, key: number})[]}
   */
  getOptions() {
    return [
      { key: 1, text: "Open", value: "Open" },
      { key: 2, text: "Close", value: "Close" },
      { key: 3, text: "Join", value: "Join" },
      { key: 4, text: "Leave", value: "Leave" }
    ];
  }

  /**
   * update our listeners
   */
  componentDidMount = () => {
    this.myController.configureMainPanelChangeListener(
      this,
      this.onActivePerspectiveChange
    );
    this.myController.configureShowConsoleWindowListener(
      this,
      this.onShowConsoleWindow
    );
  };

  /**
   * remove listeners when not in view
   */
  componentWillUnmount = () => {
    this.myController.configureMainPanelChangeListener(this, null);
    this.myController.configureShowConsoleWindowListener(this, null);
  };

  /**
   * callback function that is called when the main panels active perspective changes
   * @param perspective
   */
  onActivePerspectiveChange = (event, perspective) => {
    if (perspective === MainPanelViewController.MenuSelection.JOURNAL) {
      this.setLocation(this.getJournalLocation());
    } else if (
      perspective === MainPanelViewController.MenuSelection.TROUBLESHOOT
    ) {
      this.setLocation(this.getTroubleshootLocation());
    } else if (perspective === MainPanelViewController.MenuSelection.FLOW) {
      this.setLocation(this.getFlowLocation());
    } else {
      this.setLocation("");
    }
  };

  /**
   * used to set the default browser location. This hook is used to update the state when we go to
   * show the console for the first time. TeamModel should be loaded.
   * @param event
   * @param arg
   */
  onShowConsoleWindow = (event, arg) => {
    console.log(this.name + " show console window : " + arg);
    if (this.state.location === "") {
      this.setLocation(this.getDefaultLocation());
    }
  };

  /**
   * sets the location into the component
   * @param location
   */
  setLocation(location) {
    this.setState({ location: location });
  }

  /**
   * helper function to get the default location
   * @returns {string}
   */
  getDefaultLocation() {
    return this.getJournalLocation();
  }

  /**
   * gets the journbal uri path
   * @returns {string}
   */
  getJournalLocation() {
    return "/journal/" + this.teamModel.getActiveTeamMemberShortName();
  }

  getTroubleshootLocation() {
    return "/wtf";
  }

  getFlowLocation() {
    return "/flow";
  }

  /**
   * highlight field border when element is focused on
   * @param e
   */
  handleFocus = e => {
    document.getElementById("browserAction").classList.add("focused");
    document.getElementById("browserInput").classList.add("focused");
    document.getElementById("browserGo").classList.add("focused");
  };

  /**
   * clear all of the highlights to the fields on any element blur.. called by all
   * form element inputs
   * @param e
   */
  handleBlur = e => {
    document.getElementById("browserAction").classList.remove("focused");
    document.getElementById("browserInput").classList.remove("focused");
    document.getElementById("browserGo").classList.remove("focused");
  };

  /**
   * works the same as the click for create handler.. see above ^
   * @param e
   */
  handleKeyPressForInput = e => {
    if (e.charCode === 13) {
      console.log("load this resource into view");
    }
  };

  /**
   * loads a new perspective.
   */
  handleClickForGo = () => {
    console.log("load this resource into view");
  };

  /**
   * returns the JSX component of action drop down
   * @returns {*}
   */
  getActionDropdown() {
    let options = this.getOptions();
    return (
      <Dropdown
        disabled={this.state.disableControls}
        className="browserAction"
        id="browserAction"
        placeholder="Choose Action"
        defaultValue={options[0].value}
        selection
        options={options}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
      />
    );
  }

  /**
   * returns the browser headers input
   * @returns {*}
   */
  getBrowserInput() {
    return (
      <Input
        disabled={this.state.disableControls}
        id="browserInput"
        className="browserInput"
        fluid
        inverted
        placeholder={"loading..."}
        value={this.state.location.toLowerCase()}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onKeyPress={this.handleKeyPressForInput}
        action={
          <Button
            color="violet"
            className="browserGo"
            id="browserGo"
            onClick={this.handleClickForGo}
          >
            <Icon name="play" />
          </Button>
        }
      />
    );
  }

  /**
   * renders the journal items component from array in the console view
   * @returns {*} - the JSX to render for the journal header
   */
  render() {
    return (
      <div id="component" className="browserHeader">
        <Segment.Group>
          <Segment inverted>
            <Grid columns="equal" divided inverted>
              <Grid.Row stretched>
                <Grid.Column width={2} id="browserActionCell">
                  {this.getActionDropdown()}
                </Grid.Column>
                <Grid.Column width={14} id="browserInputCell">
                  {this.getBrowserInput()}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
