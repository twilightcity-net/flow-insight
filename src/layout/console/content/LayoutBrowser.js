import React, {Component} from "react";
import {Icon, Input, Segment,} from "semantic-ui-react";
import {RendererControllerFactory} from "../../../controllers/RendererControllerFactory";
import {BrowserRequestFactory} from "../../../controllers/BrowserRequestFactory";
import FeatureToggle from "../../shared/FeatureToggle";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class LayoutBrowser extends Component {
  /**
   * default string we show in the address bar
   * @type {string}
   */
  static locationStr = "Enter a command or a talk URI";

  /**
   * the constructor for the array of journal items to display
   * @param props - the components properties
   */
  constructor(props) {
    super(props);
    this.name = "[LayoutBrowser]";
    this.isFirstRun = true;
    this.state = {
      disableControls: false,
      disabledForward: false,
      disabledBackward: false,
      location: "",
    };
    this.myController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.LAYOUT_BROWSER,
        this
      );
  }

  /**
   * update our listeners
   */
  componentDidMount = () => {
    this.myController.configureConsoleBrowserLoadListener(
      this,
      this.onConsoleBrowserLoadEvent
    );
    this.myController.configureShowConsoleWindowListener(
      this,
      this.onShowConsoleWindowEvent
    );
    this.myController.configureFeatureToggleListener(
      this,
      this.onFeatureToggleEvent
    )
  };

  /**
   * remove listeners when not in view
   */
  componentWillUnmount = () => {
    this.myController.configureConsoleBrowserLoadListener(
      this,
      null
    );
    this.myController.configureShowConsoleWindowListener(
      this,
      null
    );
    this.myController.configureFeatureToggleListener(
      this,
      null
    )
  };

  /**
   * called when content is actively loading into the console content
   * @param event
   * @param resource
   */
  onConsoleBrowserLoadEvent = (event, resource) => {
    //when we load a page, update the button state
    this.setState({
      location: resource.uri,
      disabledForward: this.myController.hasNoForwardHistory(),
      disabledBackward: this.myController.hasNoBackwardHistory()
    });
  };

  onFeatureToggleEvent = (event, arg) => {
    console.log("onFeatureToggleEvent");
    this.requestBrowserToLoadDefaultContent();
  }

  /**
   * used to set the default browser location. This hook is used to update the state when we go to
   * show the console for the first time. TeamModel should be loaded.
   * @param event
   * @param arg
   */
  onShowConsoleWindowEvent = (event, arg) => {
    console.log(this.name + " first time console show -> load default content");
    //TODO this should use default page load until we've got a better welcome
    this.loadWelcomeContent();
    this.myController.configureShowConsoleWindowListener(
      this,
      null
    );
  };


  /**
   * Load the welcome screen content on first load
   */
  loadWelcomeContent() {
    let defaultRequest;

    if (FeatureToggle.isFlowInsightApp()) {
      defaultRequest = this.getDefaultFlowInsightPageRequest();
    } else {
      defaultRequest = BrowserRequestFactory.createRequest(
        BrowserRequestFactory.Requests.MOOVIE
      );
    }

    this.myController.makeRequest(defaultRequest);
  }

  /**
   * Get the default page request for the FlowInsight app
   */
  getDefaultFlowInsightPageRequest() {
    if (FeatureToggle.isPersonalDashboardEnabled) {
      return BrowserRequestFactory.createRequest(
        BrowserRequestFactory.Requests.FLOW,
        0
      );
    } else if (FeatureToggle.isJournalEnabled) {
      return BrowserRequestFactory.createRequest(
        BrowserRequestFactory.Requests.JOURNAL,
        "me"
      );
    } else {
      return BrowserRequestFactory.createRequest(
        BrowserRequestFactory.Requests.COMMAND,
        BrowserRequestFactory.Commands.WTF
      );
    }
  }

  /**
   * loads default content into the browser which is our /journal/me
   * #IMPORTANT #ENTRY-POINT default resource loaded page
   */
  requestBrowserToLoadDefaultContent() {
    let defaultRequest;

    if (FeatureToggle.isFlowInsightApp()) {
      defaultRequest = this.getDefaultFlowInsightPageRequest();
    } else {
      defaultRequest = BrowserRequestFactory.createRequest(
        BrowserRequestFactory.Requests.MOOVIE
      );
    }

    this.myController.makeRequest(defaultRequest);
  }

  /**
   * highlight field border when element is focused on
   */
  handleFocus = () => {
    let el = document.getElementById("browserBar");
    el.classList.add("focused");

    let input = document.getElementById("browserInput");
    input.focus();
  };

  /**
   * clear all of the highlights to the fields on any element blur.. called by all
   * form element inputs
   */
  handleBlur = () => {
    document
      .getElementById("browserBar")
      .classList.remove("focused");
  };

  /**
   * Handles the browser back button being clicked
   */
  handleBrowserBackClick = () => {
    this.myController.goBackInHistory();
  };

  /**
   * Handles the browser forward button being clicked
   */
  handleBrowserForwardClick = () => {
    this.myController.goForwardInHistory();
  };

  handleBrowserBarClick = () => {
    this.handleFocus();
  }

  /**
   * works the same as the click for create handler.. see above ^
   * @param e
   */
  handleKeyPressForInput = (e) => {
    if (e.charCode === 13) {
      //press enter
      this.handleClickForGo();
    }
  };

  /**
   * loads a new perspective.
   */
  handleClickForGo = () => {
    this.doRequest(this.state.location);
  };

  /**
   * performs the request from the input field of the component. if the action is a command
   * the create that type of request otherwise create a generic open request
   * @param uri
   */
  doRequest = (uri) => {
    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.BROWSER,
      BrowserRequestFactory.Commands.OPEN,
      uri
    );
    this.myController.makeRequest(request);
  };

  /**
   * checks our uri to see if this is a command or a location
   * @param uri
   * @returns {boolean}
   */
  isCommand(uri) {
    //so if starts with / it's routed as a location
    //if there's no slash it's a command
    return !uri.startsWith(
      BrowserRequestFactory.ROOT_SEPARATOR
    );
  }

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
   * returns the browser headers input
   * @returns {*}
   */
  getBrowserInput = () => {
    return (
      <div>
        <button className="browserHistory"
                disabled={this.state.disabledBackward}
                onClick={this.handleBrowserBackClick}>
          <Icon name="arrow left" />
        </button>
        <button className="browserHistory"
                disabled={this.state.disabledForward}
                onClick={this.handleBrowserForwardClick}>
          <Icon name="arrow right" />
        </button>
        <div className="browserBar" id="browserBar" onClick={this.handleBrowserBarClick}>
          <Input
            disabled={this.state.disableControls}
            id="browserInput"
            className="browserInput"
            label="talk://"
            fluid
            inverted
            placeholder={LayoutBrowser.locationStr}
            value={this.state.location.toLowerCase()}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            onKeyPress={this.handleKeyPressForInput}
            onChange={this.handleChangeForInput}
          />
        </div>
      </div>
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
            {this.getBrowserInput()}
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
