import React, { Component } from "react";
import {
  Icon,
  Label,
  List,
  Menu,
  Segment,
  Transition
} from "semantic-ui-react";
import { SidePanelViewController } from "../../controllers/SidePanelViewController";
import { ActiveViewControllerFactory } from "../../controllers/ActiveViewControllerFactory";
import { DimensionController } from "../../controllers/DimensionController";
import { CircuitClient } from "../../clients/CircuitClient";
import UtilRenderer from "../../UtilRenderer";
import { LearningCircuitModel } from "../../models/LearningCircuitModel";

/**
 * renders the circuit navigator panels in the gui
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
    this.myController = ActiveViewControllerFactory.createViewController(
      ActiveViewControllerFactory.Views.SIDE_PANEL
    );
  }

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
        participatingCircuitsVisible: true,
        doItLaterCircuitsVisible: false,
        animationType: SidePanelViewController.AnimationTypes.FLY_DOWN,
        animationDelay: SidePanelViewController.AnimationDelays.SUBMENU,
        title: ""
      };
    }
    return state;
  }

  refreshActiveCircuits() {
    console.log("call circuit client to refresh active circuits");
    CircuitClient.loadAllMyParticipatingCircuits(this, models => {
      this.setState({
        activeCircuits: models
      });
    });
  }

  refreshDoItLaterCircuits() {
    console.log("call circuit client to refresh do it later circuits");
  }

  showParticipatingCircuitsPanel() {
    this.refreshActiveCircuits();
    this.setState({
      activeItem:
        SidePanelViewController.SubmenuSelection.PARTICIPATING_CIRCUITS,
      participatingCircuitsVisible: false,
      doItLaterCircuitsVisible: false
    });
    setTimeout(() => {
      this.setState({
        participatingCircuitsVisible: true
      });
    }, this.state.animationDelay);
  }

  showDoItLaterCircuitsPanel() {
    this.refreshDoItLaterCircuits();
    this.setState({
      activeItem: SidePanelViewController.SubmenuSelection.DO_IT_LATER_CIRCUITS,
      participatingCircuitsVisible: false,
      doItLaterCircuitsVisible: false
    });
    setTimeout(() => {
      this.setState({
        doItLaterCircuitsVisible: true
      });
    }, this.state.animationDelay);
  }

  handleCircuitSubmenuClick = (e, { name }) => {
    this.myController.changeActiveCircuitsSubmenuPanel(name);
  };

  componentDidMount = () => {
    this.myController.configureCircuitsPanelListener(
      this,
      this.onRefreshCircuitsPanel
    );
    this.onRefreshCircuitsPanel();
  };

  componentWillUnmount = () => {
    this.myController.configureCircuitsPanelListener(this, null);
  };

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
          {this.state.activeCircuits.map(model =>
            this.getCircuitListItem(model)
          )}
        </List>
      </div>
    );
  };

  getCircuitListItem = model => {
    let retro = LearningCircuitModel.isRetro(model),
      selected = false,
      time = UtilRenderer.getTimeStringFromTimeArray(model.openTime),
      circuitName = model.circuitName,
      ownerName = model.ownerId,
      timerIcon = retro ? "balance scale" : "lightning",
      timerColor = retro ? "violet" : "red",
      className = selected ? "selected " + timerColor : timerColor;

    return (
      <List.Item className={className} key={model.id}>
        <List.Content
          floated="right"
          verticalAlign="middle"
          className="circuitLabelTimer"
        >
          <Label color={timerColor}>
            <Icon name={timerIcon} /> {time}
          </Label>
        </List.Content>
        <List.Content>
          <List.Header>{circuitName}</List.Header>
          <i className="name">({ownerName})</i>
        </List.Content>
      </List.Item>
    );
  };

  getDoItLaterCircuitsContent = () => {
    return (
      <div
        className="doItLaterCircuitsContent"
        // style={{ height: DimensionController.getSidebarPanelHeight( )}}
      >
        Do It Later Circuits List
      </div>
    );
  };

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
