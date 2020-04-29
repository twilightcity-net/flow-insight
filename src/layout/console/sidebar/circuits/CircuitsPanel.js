import React, { Component } from "react";
import {
  List,
  Menu,
  Segment,
  Transition
} from "semantic-ui-react";
import { SidePanelViewController } from "../../../../controllers/SidePanelViewController";
import { RendererControllerFactory } from "../../../../controllers/RendererControllerFactory";
import { DimensionController } from "../../../../controllers/DimensionController";
import ActiveCircuitListItem from "./ActiveCircuitListItem";
import DoItLaterCircuitListItem from "./DoItLaterCircuitListItem";
import { BrowserRequestFactory } from "../../../../controllers/BrowserRequestFactory";
import { CircuitClient } from "../../../../clients/CircuitClient";
import { RendererEventFactory } from "../../../../events/RendererEventFactory";

/**
 * renders the circuit navigator panels in the gui
 * @type {CircuitsPanel}
 */
export default class CircuitsPanel extends Component {
  /**
   * builds the circuit navigator panel
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[CircuitsPanel]";
    this.state = {
      activeItem:
        SidePanelViewController.SubmenuSelection
          .PARTICIPATING_CIRCUITS,
      participatingCircuitsVisible: false,
      doItLaterCircuitsVisible: false,
      title: ""
    };
    this.myController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.CONSOLE_SIDEBAR
    );
    this.animationType =
      SidePanelViewController.AnimationTypes.FLY_DOWN;
    this.animationDelay =
      SidePanelViewController.AnimationDelays.SUBMENU;
    this.selections = {
      activeCircuitComponent: null,
      doItLaterCircuitComponent: null
    };
    this.activeCircuits = [];
    this.doItLaterCircuits = [];
  }

  /**
   * event handler for our circuits sub menu click
   * @param e
   * @param name
   */
  handleCircuitSubmenuClick = (e, { name }) => {
    this.myController.changeActiveCircuitsSubmenuPanel(
      name
    );
  };

  /**
   * called when we remove this circuit from view. this clears the listeners for proper
   * memory management
   */
  componentWillUnmount() {
    this.circuitStartStopListener.updateCallback(
      this,
      null
    );
    this.myController.configureCircuitsPanelListener(
      this,
      null
    );
  }

  /**
   * called we are rendering this component into view. This will ask the circuit manager
   * in the main process for new circuit data
   */
  componentDidMount() {
    this.circuitStartStopListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events
        .VIEW_CONSOLE_CIRCUIT_START_STOP,
      this,
      this.onCircuitStartStop
    );
    this.myController.configureCircuitsPanelListener(
      this,
      this.onRefreshCircuitsPanel
    );
    this.onRefreshCircuitsPanel();
  }

  onCircuitStartStop = (event, arg) => {
    this.onRefreshCircuitsPanel();
  };

  /**
   * callback function that was performed when we refresh this component in the view
   */
  onRefreshCircuitsPanel = () => {
    switch (
      this.myController.activeCircuitsSubmenuSelection
    ) {
      case SidePanelViewController.SubmenuSelection
        .PARTICIPATING_CIRCUITS:
        this.showParticipatingCircuitsPanel();
        break;
      case SidePanelViewController.SubmenuSelection
        .DO_IT_LATER_CIRCUITS:
        this.showDoItLaterCircuitsPanel();
        break;
      default:
        throw new Error("Unknown circuits panel menu item");
    }
  };

  /**
   * shows our active circuits that we are joined to
   */
  showParticipatingCircuitsPanel() {
    this.setState({
      activeItem:
        SidePanelViewController.SubmenuSelection
          .PARTICIPATING_CIRCUITS,
      participatingCircuitsVisible: true,
      doItLaterCircuitsVisible: false
    });
    CircuitClient.getAllMyParticipatingCircuits(
      this,
      arg => {
        this.activeCircuits = arg.data;
        this.forceUpdate();
      }
    );
  }

  /**
   * shows our list of circuits we are participating in that are currently on hold
   * with a do it later status
   */
  showDoItLaterCircuitsPanel() {
    this.setState({
      activeItem:
        SidePanelViewController.SubmenuSelection
          .DO_IT_LATER_CIRCUITS,
      participatingCircuitsVisible: false,
      doItLaterCircuitsVisible: true
    });
    CircuitClient.getAllMyDoItLaterCircuits(this, arg => {
      this.doItLaterCircuits = arg.data;
      this.forceUpdate();
    });
  }

  /**
   * mouse click handler for when a user clicks on an item in the active circuit list
   * @param component
   */
  handleClickActiveCircuit = component => {
    this.selections.activeCircuitComponent = component;
    let circuitName = component.props.model.circuitName;
    this.requestBrowserToLoadActiveCircuit(circuitName);
  };

  /**
   * handles our do it later circuit click
   * @param component
   */
  handleClickDoItLaterCircuit = component => {
    this.selections.doItLaterCircuitComponent = component;
    let circuitName = component.props.model.circuitName;
    this.requestBrowserToLoadDoItLaterCircuit(circuitName);
  };

  /**
   * creates a new request and dispatch this to the browser request listener
   * @param circuitName
   */
  requestBrowserToLoadActiveCircuit(circuitName) {
    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.ACTIVE_CIRCUIT,
      circuitName
    );
    this.myController.makeSidebarBrowserRequest(request);
  }

  /**
   * generates a browser request object from a gieven circuit name
   * @param circuitName
   */
  requestBrowserToLoadDoItLaterCircuit(circuitName) {
    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.DO_IT_LATER_CIRCUIT,
      circuitName
    );
    this.myController.makeSidebarBrowserRequest(request);
  }

  /**
   * get our active circuits content to render in the gui
   * @returns {*}
   */
  getParticipatingCircuitsContent = () => {
    return (
      <div className="participatingCircuitsContent">
        <List
          inverted
          divided
          celled
          animated
          verticalAlign="middle"
          size="large"
        >
          {this.activeCircuits.map(model => (
            <ActiveCircuitListItem
              key={model.id}
              model={model}
              onActiveCircuitListItemClick={
                this.handleClickActiveCircuit
              }
            />
          ))}
        </List>
      </div>
    );
  };

  /**
   * builds our do it later content panel for render() in the gui
   * @returns {*}
   */
  getDoItLaterCircuitsContent = () => {
    return (
      <div className="participatingCircuitsContent">
        <List
          inverted
          divided
          celled
          animated
          verticalAlign="middle"
          size="large"
        >
          {this.doItLaterCircuits.map(model => (
            <DoItLaterCircuitListItem
              key={model.id}
              model={model}
              onDoItCircuitListItemClick={
                this.handleClickDoItLaterCircuit
              }
            />
          ))}
        </List>
      </div>
    );
  };

  /**
   * renders our component in the gui
   * @returns {*}
   */
  render() {
    let { activeItem } = this.state;
    return (
      <div
        id="component"
        className="consoleSidebarPanel circuitsPanel"
        style={{
          width: "100%",
          height: DimensionController.getHeightFor(
            DimensionController.Components.CONSOLE_LAYOUT
          ),
          opacity: 1
        }}
      >
        <Segment.Group>
          <Menu size="mini" inverted pointing secondary>
            <Menu.Item
              name={
                SidePanelViewController.SubmenuSelection
                  .PARTICIPATING_CIRCUITS
              }
              active={
                activeItem ===
                SidePanelViewController.SubmenuSelection
                  .PARTICIPATING_CIRCUITS
              }
              onClick={this.handleCircuitSubmenuClick}
            />
            <Menu.Item
              name={
                SidePanelViewController.SubmenuSelection
                  .DO_IT_LATER_CIRCUITS
              }
              active={
                activeItem ===
                SidePanelViewController.SubmenuSelection
                  .DO_IT_LATER_CIRCUITS
              }
              onClick={this.handleCircuitSubmenuClick}
            />
          </Menu>
          <Segment
            inverted
            className={"circuitsContentWrapper"}
            style={{
              height: DimensionController.getCircuitsSidebarPanelHeight()
            }}
          >
            <Transition
              visible={
                this.state.participatingCircuitsVisible
              }
              animation={this.animationType}
              duration={this.animationDelay}
              unmountOnHide
            >
              {this.getParticipatingCircuitsContent()}
            </Transition>
            <Transition
              visible={this.state.doItLaterCircuitsVisible}
              animation={this.animationType}
              duration={this.animationDelay}
              unmountOnHide
            >
              {this.getDoItLaterCircuitsContent()}
            </Transition>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
