import React, { Component } from "react";
import {
  Divider,
  Icon,
  Menu,
  Popup
} from "semantic-ui-react";
import { RendererControllerFactory } from "../../../controllers/RendererControllerFactory";
import { SidePanelViewController } from "../../../controllers/SidePanelViewController";
import { DimensionController } from "../../../controllers/DimensionController";
import { RendererEventFactory } from "../../../events/RendererEventFactory";

/**
 * this component is the sidebar to the console. This animates a slide.
 * @type{ConsoleSidebar}
 */
export default class ConsoleSidebar extends Component {
  /**
   * the class name of our root console side bar component
   * @type {string}
   */
  static className = "consoleSidebar";

  /**
   * the class name of our alarm menu item
   * @type {string}
   */
  static alarmClassName = "alarm";

  /**
   * builds the console sidebar and panel with given properties
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ConsoleSidebar]";
    this.state = {
      isAlarm: false,
      activeItem:
        SidePanelViewController.MenuSelection.TEAM,
      iconSpirit: "heart outline",
      iconTeam: "user",
      iconWTF: "lightning",
      iconCircuit: "star outline",
      iconNotifications: "bell outline"
    };
    this.myController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.CONSOLE_SIDEBAR
    );
  }

  /**
   * called when the sidebar is created in the view and will render
   */
  componentDidMount() {
    this.myController.configurePulseListener(
      this,
      this.onPulse
    );
    this.myController.configureHeartbeatListener(
      this,
      this.onHeartbeat
    );
    this.myController.configureMenuListener(
      this,
      this.onRefresh
    );
    this.myController.configureSidebarShowListener(
      this,
      this.onSidebarShow
    );
    this.circuitStartStopListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events
        .VIEW_CONSOLE_CIRCUIT_START_STOP,
      this,
      this.onCircuitStartStop
    );
    this.circuitPauseResumeListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events
        .VIEW_CONSOLE_CIRCUIT_PAUSE_RESUME,
      this,
      this.onCircuitPauseResume
    );
    this.circuitSolveListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events
        .VIEW_CONSOLE_CIRCUIT_SOLVE,
      this,
      this.onCircuitSolve
    );
    this.circuitJoinLeaveListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events
        .VIEW_CONSOLE_CIRCUIT_JOIN_LEAVE,
      this,
      this.onCircuitJoinLeave
    );
  }

  /**
   * called when we remove the console sidebar panel and menu from view
   */
  componentWillUnmount() {
    this.myController.clearHeartbeatListener();
    this.myController.clearMenuListener();
    this.myController.clearPulseListener();
    this.myController.clearSidebarShowListener();
    this.circuitStartStopListener.clear();
    this.circuitPauseResumeListener.clear();
  }

  /**
   * called when our app heartbeat pulses
   * @param event
   * @param arg
   */
  onHeartbeat(event, arg) {
    this.setState({
      isOnline: arg.isOnline,
      pingTime: arg.pingTime,
      latencyTime: arg.latencyTime,
      talkUrl: arg.talkUrl,
      server: arg.server,
      errorMsg: arg.message
    });
  }

  /**
   * called when we pulse the app every 20 s from talk socket ping pong
   * @param event
   * @param arg
   */
  onPulse(event, arg) {
    this.setState({
      latencyTime: arg.latencyTime
    });
  }

  /**
   * event handler for when we join or leave a circuit
   * @param event
   * @param arg
   */
  onCircuitJoinLeave = (event, arg) => {
    this.setState({
      isAlarm: arg > 0
    });
  };

  /**
   * event handler for when we start and stop our active circuit
   * @param event
   * @param arg
   */
  onCircuitStartStop = (event, arg) => {
    this.setState({
      isAlarm: arg > 0
    });
  };

  /**
   * handles our pause and resume event that was spawned from our resource
   * circuit controller.. usually ;)
   * @param event
   * @param arg
   */
  onCircuitPauseResume = (event, arg) => {
    this.setState({
      isAlarm: arg < 0
    });
  };

  /**
   * event handler for when the user solves a wtf. this will remove
   * the flashing active circuit model from the wtf button.
   * @param event
   * @param arg
   */
  onCircuitSolve = (event, arg) => {
    this.setState({
      isAlarm: false
    });
  };

  /**
   * event listener for when our sidebar panel needs to update and change
   * @param event
   * @param arg
   */
  onSidebarShow(event, arg) {
    console.log(
      this.name +
        " shortcut recieved -> sidebar show : " +
        arg
    );
    switch (arg) {
      case 1:
        this.showPanel(
          SidePanelViewController.MenuSelection.TEAM
        );
        break;
      case 2:
        this.showPanel(
          SidePanelViewController.MenuSelection.CIRCUITS
        );
        break;
      case 3:
        this.showPanel(
          SidePanelViewController.MenuSelection.SPIRIT
        );
        break;
      case 4:
        this.showPanel(
          SidePanelViewController.MenuSelection
            .NOTIFICATIONS
        );
        break;
      case 0:
        this.showPanel(
          SidePanelViewController.MenuSelection.WTF
        );
        break;
      default:
        throw new Error(
          "Unknown console sidebar show arg " + arg
        );
    }
  }

  /**
   * function handler that os called when the console layout perspective changes
   */
  onRefresh() {
    let activeMenuItem = this.myController
      .activeMenuSelection;
    let state = {
      activeItem: activeMenuItem,
      iconSpirit: "heart",
      iconTeam: "user",
      iconWTF: "lightning",
      iconNotifications: "bell",
      iconCircuit: "star"
    };
    let oStr = " outline";
    switch (activeMenuItem) {
      case SidePanelViewController.MenuSelection.TEAM:
        state.iconSpirit += oStr;
        state.iconCircuit += oStr;
        state.iconNotifications += oStr;
        break;
      case SidePanelViewController.MenuSelection.CIRCUITS:
        state.iconSpirit += oStr;
        state.iconTeam += oStr;
        state.iconNotifications += oStr;
        break;
      case SidePanelViewController.MenuSelection.SPIRIT:
        state.iconTeam += oStr;
        state.iconCircuit += oStr;
        state.iconNotifications += oStr;
        break;
      case SidePanelViewController.MenuSelection
        .NOTIFICATIONS:
        state.iconSpirit += oStr;
        state.iconTeam += oStr;
        state.iconCircuit += oStr;
        break;
      case SidePanelViewController.MenuSelection.NONE:
        state.iconSpirit += oStr;
        state.iconTeam += oStr;
        state.iconCircuit += oStr;
        state.iconNotifications += oStr;
        break;
      default:
        break;
    }
    this.setState(state);
  }

  /**
   * event click handler for the menu
   * @param e
   * @param name
   */
  handleItemClick = (e, { name }) => {
    if (this.state.activeItem === name) {
      this.myController.hidePanel();
    } else if (
      name === SidePanelViewController.MenuSelection.WTF &&
      this.state.isAlarm
    ) {
      this.myController.loadWTF();
    } else if (
      name === SidePanelViewController.MenuSelection.WTF
    ) {
      this.myController.startWTF();
    } else {
      this.myController.showPanel(name);
    }
  };

  /**
   * renders our network connection popup tooltip on our shell
   * @param server
   * @param pingTime
   * @param talkUrl
   * @param latencyTime
   * @param isOnline
   * @param errorMsg
   * @returns {*}
   */
  getPopupContent(
    server,
    pingTime,
    talkUrl,
    latencyTime,
    isOnline,
    errorMsg
  ) {
    return (
      <div>
        <div>
          <i>{server}</i>
        </div>
        <div>
          <i>ping: </i>
          <b>
            <i>
              {pingTime <= 0
                ? "calculating..."
                : pingTime + "ms"}
            </i>
          </b>
        </div>
        <Divider />
        <div>
          <i>{talkUrl}</i>
        </div>
        <div>
          <i>latency: </i>
          <b>
            <i>
              {latencyTime <= 0
                ? "calculating..."
                : latencyTime + "ms"}
            </i>
          </b>
        </div>
        {!isOnline && (
          <div className="errorMsg">
            <i style={{ color: "red" }}>
              <b>{errorMsg}</b>
            </i>
          </div>
        )}
      </div>
    );
  }

  /**
   * renders the sidebar of the console view
   */
  render() {
    const {
      activeItem,
      isOnline,
      pingTime,
      latencyTime,
      talkUrl,
      server,
      errorMsg
    } = this.state;

    let iconClassName = isOnline
        ? "signal"
        : "remove circle",
      menuClassName = isOnline
        ? "networkConnect"
        : "networkConnectError",
      iconColor = isOnline ? "green" : "red";

    if (isOnline === undefined) {
      menuClassName = "networkLoading";
      iconClassName = "wait";
      iconColor = "grey";
    }
    const networkConnectMenuItem = (
      <Menu.Item header className={menuClassName}>
        <Icon name={iconClassName} color={iconColor} />
      </Menu.Item>
    );
    const popupContent = this.getPopupContent(
      server,
      pingTime,
      talkUrl,
      latencyTime,
      isOnline,
      errorMsg
    );
    return (
      <div
        id="component"
        className={ConsoleSidebar.className}
      >
        <Menu
          inverted
          icon
          vertical
          style={{
            height: DimensionController.getConsoleSidebarHeight()
          }}
        >
          <Menu.Item
            name={
              SidePanelViewController.MenuSelection.TEAM
            }
            active={
              activeItem ===
              SidePanelViewController.MenuSelection.TEAM
            }
            onClick={this.handleItemClick}
          >
            <Icon name={this.state.iconTeam} />
          </Menu.Item>
          <Menu.Item
            name={
              SidePanelViewController.MenuSelection.CIRCUITS
            }
            active={
              activeItem ===
              SidePanelViewController.MenuSelection.CIRCUITS
            }
            onClick={this.handleItemClick}
          >
            <Icon name={this.state.iconCircuit} />
          </Menu.Item>
          <Menu.Item
            name={
              SidePanelViewController.MenuSelection.SPIRIT
            }
            active={
              activeItem ===
              SidePanelViewController.MenuSelection.SPIRIT
            }
            onClick={this.handleItemClick}
          >
            <Icon name={this.state.iconSpirit} />
          </Menu.Item>
          <Menu.Item
            name={
              SidePanelViewController.MenuSelection
                .NOTIFICATIONS
            }
            active={
              activeItem ===
              SidePanelViewController.MenuSelection
                .NOTIFICATIONS
            }
            onClick={this.handleItemClick}
          >
            <Icon name={this.state.iconNotifications} />
          </Menu.Item>
          <Menu.Item
            name={SidePanelViewController.MenuSelection.WTF}
            active={
              activeItem ===
              SidePanelViewController.MenuSelection.WTF
            }
            onClick={this.handleItemClick}
            className={
              this.state.isAlarm
                ? ConsoleSidebar.alarmClassName
                : ""
            }
          >
            <Icon name={this.state.iconWTF} />
          </Menu.Item>
          <Popup
            trigger={networkConnectMenuItem}
            className="chunkTitle"
            content={popupContent}
            position="top left"
            offset={-2}
            inverted
          />
        </Menu>
      </div>
    );
  }
}
