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

  openParticipatingCircuuitsPanel() {
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

  openDoItLaterCircuitsPanel() {
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
      this.onRefreshActivePerspective
    );
  };

  onRefreshActivePerspective() {
    switch (this.myController.activeCircuitsSubmenuSelection) {
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
          {this.getCircuitListItem(false, "Zoe Love", "5 min", false)}
          {this.getCircuitListItem(false, "Zoe Love", "5 min", true)}
          {this.getCircuitListItem(false, "Zoe Love", "5 min", false)}
          {this.getCircuitListItem(true, "Zoe Love", "5 min", false)}
          {this.getCircuitListItem(false, "Zoe Love", "5 min", false)}
          {this.getCircuitListItem(false, "Zoe Love", "5 min", true)}
          {this.getCircuitListItem(false, "Zoe Love", "5 min", true)}
          {this.getCircuitListItem(false, "Zoe Love", "5 min", false)}
          {this.getCircuitListItem(false, "Zoe Love", "5 min", false)}
          {this.getCircuitListItem(false, "Zoe Love", "5 min", true)}
          {this.getCircuitListItem(false, "Zoe Love", "5 min", false)}
          {this.getCircuitListItem(false, "Zoe Love", "5 min", false)}
          {this.getCircuitListItem(false, "Zoe Love", "5 min", false)}
          {this.getCircuitListItem(false, "Zoe Love", "5 min", false)}
          {this.getCircuitListItem(false, "Zoe Love", "5 min", true)}
          {this.getCircuitListItem(false, "Zoe Love", "5 min", false)}
          {this.getCircuitListItem(false, "Zoe Love", "5 min", false)}
        </List>
      </div>
    );
  };

  getCircuitListItem = (selected, name, time, retro) => {
    let timerIcon = retro ? "balance scale" : "lightning",
      timerColor = retro ? "violet" : "red",
      className = selected ? "selected " + timerColor : timerColor;

    return (
      <List.Item className={className}>
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
          <List.Header>Some Circuit Name</List.Header>
          <i className="name">({name})</i>
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
