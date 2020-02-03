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
// import { DataModelFactory } from "../../models/DataModelFactory";
import { BrowserRequestFactory } from "../../controllers/BrowserRequestFactory";
import { PerspectiveController } from "../../controllers/PerspectiveController";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class BrowserHeader extends Component {
  /**
   * default string we show in the address bar
   * @type {string}
   */
  static locationStr = "Search Twilight or type a URI";
  /**
   * the constructor for the array of journal items to display
   * @param props - the components properties
   */
  constructor(props) {
    super(props);
    this.name = "[BrowserHeader]";
    this.state = {
      disableControls: false,
      location: "",
      action: this.getOptions()[0].value
    };
    this.myController = ActiveViewControllerFactory.createViewController(
      ActiveViewControllerFactory.Views.BROWSER_PANEL,
      this
    );
    // this.teamModel = DataModelFactory.createModel(
    //   DataModelFactory.Models.MEMBER_STATUS
    // );
  }

  /**
   * gets hardcoded array of actions used by the dropdown in the browser
   * @returns {*}
   */
  getOptions() {
    return [
      {
        key: 1,
        text: BrowserRequestFactory.Actions.OPEN,
        value: BrowserRequestFactory.Actions.OPEN
      },
      {
        key: 2,
        text: BrowserRequestFactory.Actions.CLOSE,
        value: BrowserRequestFactory.Actions.CLOSE
      },
      {
        key: 3,
        text: BrowserRequestFactory.Actions.JOIN,
        value: BrowserRequestFactory.Actions.JOIN
      },
      {
        key: 4,
        text: BrowserRequestFactory.Actions.LEAVE,
        value: BrowserRequestFactory.Actions.LEAVE
      }
    ];
  }

  /**
   * update our listeners
   */
  componentDidMount = () => {
    this.myController.configureConsoleBrowserRequestListener(
      this,
      this.onConsoleBrowserRequestEvent
    );
    this.myController.configureShowConsoleWindowListener(
      this,
      this.onShowConsoleWindowEvent
    );
  };

  /**
   * remove listeners when not in view
   */
  componentWillUnmount = () => {
    this.myController.consoleBrowserRequestListener(this, null);
    this.myController.configureShowConsoleWindowListener(this, null);
  };

  /**
   * called when we wish to load content via the browser into the console
   * @param event
   * @param request
   */
  onConsoleBrowserRequestEvent = (event, request) => {
    console.log(this.name + " proecess request -> " + JSON.stringify(request));
    this.myController.processRequest(request);
  };

  /**
   * used to set the default browser location. This hook is used to update the state when we go to
   * show the console for the first time. TeamModel should be loaded.
   * @param event
   * @param arg
   */
  onShowConsoleWindowEvent = (event, arg) => {
    console.log(this.name + " first time console show -> load default content");
    this.requestBrowserToLoadDefaultContent();
    this.myController.configureShowConsoleWindowListener(this, null);
    // console.log(this.name + " show console window : " + arg);
    // this.setState({
    //   location: "/journal/" + this.teamModel.getActiveTeamMemberShortName()
    // });
  };

  /**
   * loads default content into the browser which is our /journal/me
   */
  requestBrowserToLoadDefaultContent() {
    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.JOURNAL,
      BrowserRequestFactory.Locations.ME
    );
    this.myController.makeRequest(request);
    PerspectiveController.firstTimeShown = true;
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
      this.handleClickForGo();
    }
  };

  /**
   * loads a new perspective.
   */
  handleClickForGo = () => {
    this.doRequest(this.state.action, this.state.location);
  };

  /**
   * performs the request from the input field of the component
   * @param action
   * @param uril
   */
  doRequest = (action, uril) => {
    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.BROWSER,
      action,
      uril
    );
    this.myController.makeRequest(request);
  };

  /**
   * handles the event that is notified on change of an input link
   * @param e
   * @param name
   * @param value
   */
  handleChangeForInput = (e, { value }) => {
    this.setState({ location: value.toLowerCase() });
  };

  /**
   * handler for when things change in the dropdown
   * @param e
   * @param value
   */
  handleChangeForAction = (e, { value }) => {
    this.setState({ action: value });
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
        selection
        options={options}
        value={this.state.action}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onChange={this.handleChangeForAction}
      />
    );
  }

  /**
   * returns the browser headers input
   * @returns {*}
   */
  getBrowserInput = () => {
    return (
      <Input
        disabled={this.state.disableControls}
        id="browserInput"
        className="browserInput"
        fluid
        inverted
        placeholder={BrowserHeader.locationStr}
        value={this.state.location.toLowerCase()}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onKeyPress={this.handleKeyPressForInput}
        onChange={this.handleChangeForInput}
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
  };

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
