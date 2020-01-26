import React, { Component } from "react";
import { Menu, Segment, Transition } from "semantic-ui-react";
import { SidePanelViewController } from "../../controllers/SidePanelViewController";
import { ActiveViewControllerFactory } from "../../controllers/ActiveViewControllerFactory";
import {DimensionController} from "../../controllers/DimensionController";

export default class CircuitsPanel extends Component {

  constructor(props) {
    super(props);
    this.state = this.loadState();
    this.name = "[CircuitsPanel]";

    this.myController = ActiveViewControllerFactory.createViewController(
      ActiveViewControllerFactory.Views.SIDE_PANEL
    );
  }

  loadState() {
    let state = this.props.loadStateCb();
    if (!state) {
      return {
        activeItem: SidePanelViewController.SubmenuSelection.ACTIVE_CIRCUIT,
        activeCircuitVisible: true,
        participatingCircuuitsVisible: false,
        doItLaterCircuuitsVisible: false,
        animationType: "fly down",
        animationDelay: 350,
        title: ""
      };
    }
    return state;
  }

  openActiveCircuitsPanel() {
    this.setState({
      activeItem: SidePanelViewController.SubmenuSelection.ACTIVE_CIRCUIT,
      activeCircuitVisible: false,
      participatingCircuuitsVisible: false,
      doItLaterCircuuitsVisible: false,
    });
    setTimeout(() => {
      this.setState({
        spiritVisible: true
      });
    }, this.state.animationDelay);
  }

  openParticipatingCircuuitsPanel() {
    this.setState({
      activeItem:
        SidePanelViewController.SubmenuSelection.PARTICIPATING_CIRCUITS,
      activeCircuitVisible: false,
      participatingCircuuitsVisible: false,
      doItLaterCircuuitsVisible: false,
    });
    setTimeout(() => {
      this.setState({
        badgesVisible: true
      });
    }, this.state.animationDelay);
  }

  openDoItLaterCircuitsPanel() {
    this.setState({
      activeItem:
      SidePanelViewController.SubmenuSelection.PARTICIPATING_CIRCUITS,
      activeCircuitVisible: false,
      participatingCircuuitsVisible: false,
      doItLaterCircuuitsVisible: false,
    });
    setTimeout(() => {
      this.setState({
        badgesVisible: true
      });
    }, this.state.animationDelay);
  }

  // TODO combine these handlers

  handleActiveCircuitClick = (e, { name }) => {
    this.myController.changeActiveCircuitsSubmenuPanel(name);
  };

  handleParticipatingCircuitsClick = (e, { name }) => {
    this.myController.changeActiveCircuitsSubmenuPanel(name);
  };

  handleDoItLaterCircuitsClick = (e, { name }) => {
    this.myController.changeActiveCircuitsSubmenuPanel(name);
  };

  componentDidMount = () => {
    this.myController.configureCircuitsPanelListener(
      this,
      this.onRefreshActivePerspective
    );
  };

  onRefreshActivePerspective() {
    switch (this.myController.activeSubmenuSelection) {
      case SidePanelViewController.SubmenuSelection.ACTIVE_CIRCUIT:
        this.openActiveCircuitsPanel();
        break;
      case SidePanelViewController.SubmenuSelection.PARTICIPATING_CIRCUITS:
        this.openParticipatingCircuuitsPanel();
        break;
      case SidePanelViewController.SubmenuSelection.DO_IT_LATER_CIRCUITS:
        this.openDoItLaterCircuitsPanel();
        break;
      default:
        throw new Error("Unknown circuits panel menu item");
    }
  }

  getActiveCircuitContent = () => {
    return (
      <div className="activeCircuitsContent" style={{ height: DimensionController.getSidebarPanelHeight()}}>
        <Segment>
          Content
        </Segment>
      </div>
    );
  };

  getParticipatingCircuitsContent = () => {
    return (
      <div className="participatingCircuitsContent" style={{ height: DimensionController.getSidebarPanelHeight()}}>
        <Segment>
          Content
        </Segment>
      </div>
    );
  };

  render() {
    const { activeItem } = this.state;
    return (
      <div
        id="component"
        className="consoleSidebarPanel"
        style={{
          width: "100%",
          height: DimensionController.getSidebarPanelHeight(),
          opacity: 1
        }}
      >
        <Segment.Group>
          <Menu size="mini" inverted secondary>
            <Menu.Item
              name={SidePanelViewController.SubmenuSelection.ACTIVE_CIRCUIT}
              active={
                activeItem ===
                SidePanelViewController.SubmenuSelection.ACTIVE_CIRCUIT
              }
              onClick={this.handleActiveCircuitClick}
              color={"violet"}
            />
            <Menu.Item
              name={
                SidePanelViewController.SubmenuSelection.PARTICIPATING_CIRCUITS
              }
              active={
                activeItem ===
                SidePanelViewController.SubmenuSelection.PARTICIPATING_CIRCUITS
              }
              onClick={this.handleParticipatingCircuitsClick}
              color={"violet"}
            />
          </Menu>
          <Segment inverted className={"circuitsContentWrapper"}>
            <Transition
              visible={this.state.activeCircuitVisible}
              animation={this.state.animationType}
              duration={this.state.animationDelay}
              unmountOnHide
            >
              {this.getActiveCircuitContent()}
            </Transition>
            <Transition
              visible={this.state.participatingCircuuitsVisible}
              animation={this.state.animationType}
              duration={this.state.animationDelay}
              unmountOnHide
            >
              {this.getParticipatingCircuitsContent()}
            </Transition>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
