import React, {Component} from "react";
import {Button, Icon, Input, Segment,} from "semantic-ui-react";
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
  static locationStr = "Search "+FeatureToggle.appName+ " or type a URI";

  /**
   * the constructor for the array of journal items to display
   * @param props - the components properties
   */
  constructor(props) {
    super(props);
    this.name = "[LayoutBrowser]";
    this.state = {
      disableControls: false,
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
    this.myController.configureConsoleBrowserRequestListener(
      this,
      this.onConsoleBrowserRequestEvent
    );
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
    this.myController.configureConsoleBrowserRequestListener(
      this,
      null
    );
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
   * called when we wish to load content via the browser into the console
   * @param event
   * @param request
   */
  onConsoleBrowserRequestEvent = (event, request) => {
    this.myController.processRequest(request);
  };

  /**
   * called when content is actively loading into the console content
   * @param event
   * @param resource
   */
  onConsoleBrowserLoadEvent = (event, resource) => {
    this.setState({
      location: resource.uri,
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
    console.log(
      this.name +
        " first time console show -> load default content"
    );
    this.requestBrowserToLoadDefaultContent();
    this.myController.configureShowConsoleWindowListener(
      this,
      null
    );
  };

  /**
   * loads default content into the browser which is our /journal/me
   * #IMPORTANT #ENTRY-POINT default resource loaded page
   */
  requestBrowserToLoadDefaultContent() {
    let defaultRequest;

    if (FeatureToggle.isFlowInsightApp()) {
      if (FeatureToggle.isJournalEnabled) {
        defaultRequest = BrowserRequestFactory.createRequest(
          BrowserRequestFactory.Requests.JOURNAL,
          "me"
        );
      } else {
        defaultRequest = BrowserRequestFactory.createRequest(
          BrowserRequestFactory.Requests.COMMAND,
          BrowserRequestFactory.Commands.WTF
        );
      }


    } else {
      defaultRequest = BrowserRequestFactory.createRequest(
        BrowserRequestFactory.Requests.MOOVIE
      );
    }

    this.myController.makeRequest(defaultRequest);
  }

  /**
   * highlight field border when element is focused on
   * @param e
   */
  handleFocus = (e) => {
    document
      .getElementById("browserInput")
      .classList.add("focused");
    document
      .getElementById("browserGo")
      .classList.add("focused");
  };

  /**
   * clear all of the highlights to the fields on any element blur.. called by all
   * form element inputs
   * @param e
   */
  handleBlur = (e) => {
    document
      .getElementById("browserInput")
      .classList.remove("focused");
    document
      .getElementById("browserGo")
      .classList.remove("focused");
  };

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
        <button className="browserProtocol" disabled>
          talk://
        </button>
        <div className="browserBar">
          <Input
            disabled={this.state.disableControls}
            id="browserInput"
            className="browserInput"
            fluid
            inverted
            placeholder={LayoutBrowser.locationStr}
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
