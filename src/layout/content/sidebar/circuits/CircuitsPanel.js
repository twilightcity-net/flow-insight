import React, { Component } from "react";
import { List, Menu, Segment, Transition } from "semantic-ui-react";
import { SidePanelViewController } from "../../../../controllers/SidePanelViewController";
import { RendererControllerFactory } from "../../../../controllers/RendererControllerFactory";
import { DimensionController } from "../../../../controllers/DimensionController";
import { CircuitClient } from "../../../../clients/CircuitClient";
import ActiveCircuitListItem from "./ActiveCircuitListItem";
import { BrowserRequestFactory } from "../../../../controllers/BrowserRequestFactory";

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
    this.state = this.loadState();
    this.name = "[CircuitsPanel]";
    this.myController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.CONSOLE_SIDEBAR
    );
    this.selections = {
      activeCircuitComponent: null
    };
  }

  // TODO create a timer to update the strings in the timer labels. this should cycle though all
  //      the list items states and update the time striing. This should rerender that specific
  //      list item. do this after we are getting strings back from the server

  /**
   * loads the state from the parent
   * @returns {*|{participatingCircuitsVisible: boolean, doItLaterCircuitsVisible: boolean, animationDelay: number, activeItem: string, title: string, animationType: string}}
   */
  loadState() {
    let state = this.props.loadStateCb();
    if (!state) {
      return {
        activeCircuits: CircuitClient.activeCircuits,
        activeItem:
          SidePanelViewController.SubmenuSelection.PARTICIPATING_CIRCUITS,
        participatingCircuitsVisible: false,
        doItLaterCircuitsVisible: false,
        animationType: SidePanelViewController.AnimationTypes.FLY_DOWN,
        animationDelay: SidePanelViewController.AnimationDelays.SUBMENU,
        title: ""
      };
    }
    return state;
  }

  /**
   * refreshes our active circuits array with new data
   */
  refreshActiveCircuits() {
    CircuitClient.loadAllMyParticipatingCircuits(this, models => {
      this.setState({
        activeCircuits: models
      });
    });
  }

  /**
   * refresh our array of do it later on hold circuits
   */
  refreshDoItLaterCircuits() {
    console.log("call circuit client to refresh do it later circuits");

    //TODO implement this function to show do it later on hold circuits
  }

  /**
   * shows our active circuits that we are joined to
   */
  showParticipatingCircuitsPanel() {
    this.refreshActiveCircuits();
    this.setState({
      activeItem:
        SidePanelViewController.SubmenuSelection.PARTICIPATING_CIRCUITS,
      participatingCircuitsVisible: true,
      doItLaterCircuitsVisible: false
    });
  }

  /**
   * shows our list of circuits we are participating in that are currently on hold
   * with a do it later status
   */
  showDoItLaterCircuitsPanel() {
    this.refreshDoItLaterCircuits();
    this.setState({
      activeItem: SidePanelViewController.SubmenuSelection.DO_IT_LATER_CIRCUITS,
      participatingCircuitsVisible: false,
      doItLaterCircuitsVisible: true
    });
  }

  /**
   * event handler for our circuits sub menu click
   * @param e
   * @param name
   */
  handleCircuitSubmenuClick = (e, { name }) => {
    this.myController.changeActiveCircuitsSubmenuPanel(name);
  };

  /**
   * called we are rendering this component into view. This will ask the circuit manager
   * in the main process for new circuit data
   */
  componentDidMount = () => {
    this.myController.configureCircuitsPanelListener(
      this,
      this.onRefreshCircuitsPanel
    );
    this.onRefreshCircuitsPanel();
  };

  /**
   * called when we remove this circuit from view. this clears the listeners for proper
   * memory management
   */
  componentWillUnmount = () => {
    this.myController.configureCircuitsPanelListener(this, null);
  };

  /**
   * mouse click handler for when a user clicks on an item in the active circuit list
   * @param component
   */
  handleClickActiveCircuit = component => {
    if (this.selections.activeCircuitComponent) {
      this.selections.activeCircuitComponent.setState({
        isSelected: false
      });
    }
    this.selections.activeCircuitComponent = component;
    let circuitName = component.props.model.circuitName;
    this.requestBrowserToLoadActiveCircuit(circuitName);
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
   * callback function that is performed when we refresh this component in the view
   */
  onRefreshCircuitsPanel() {
    switch (this.myController.activeCircuitsSubmenuSelection) {
      case SidePanelViewController.SubmenuSelection.PARTICIPATING_CIRCUITS:
        this.showParticipatingCircuitsPanel();
        break;
      case SidePanelViewController.SubmenuSelection.DO_IT_LATER_CIRCUITS:
        this.showDoItLaterCircuitsPanel();
        break;
      default:
        throw new Error("Unknown circuits panel menu item");
    }
  }

  /**
   * get our active circuits content to render in the gui
   * @returns {*}
   */
  getParticipatingCircuitsContent = () => {
    return (
      <div
        className="participatingCircuitsContent"
        style={{
          height: "100%"
        }}
      >
        <List
          inverted
          divided
          celled
          animated
          verticalAlign="middle"
          size="large"
        >
          {this.state.activeCircuits.map(model => (
            <ActiveCircuitListItem
              key={model.id}
              model={model}
              onActiveCircuitListItemClick={this.handleClickActiveCircuit}
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
      <div className="doItLaterCircuitsContent">
        <i>Currently no circuits :)</i>
      </div>
    );
  };

  /**
   * renders our component in the gui
   * @returns {*}
   */
  render() {
    const { activeItem } = this.state;
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
                SidePanelViewController.SubmenuSelection.PARTICIPATING_CIRCUITS
              }
              active={
                activeItem ===
                SidePanelViewController.SubmenuSelection.PARTICIPATING_CIRCUITS
              }
              onClick={this.handleCircuitSubmenuClick}
            />
            <Menu.Item
              name={
                SidePanelViewController.SubmenuSelection.DO_IT_LATER_CIRCUITS
              }
              active={
                activeItem ===
                SidePanelViewController.SubmenuSelection.DO_IT_LATER_CIRCUITS
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
              visible={this.state.participatingCircuitsVisible}
              animation={this.state.animationType}
              duration={this.state.animationDelay}
              unmountOnHide
            >
              {this.getParticipatingCircuitsContent()}
            </Transition>
            <Transition
              visible={this.state.doItLaterCircuitsVisible}
              animation={this.state.animationType}
              duration={this.state.animationDelay}
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
