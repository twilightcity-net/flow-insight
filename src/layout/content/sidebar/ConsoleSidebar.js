import React, { Component } from "react";
import { Divider, Icon, Menu, Popup } from "semantic-ui-react";
import { RendererControllerFactory } from "../../../controllers/RendererControllerFactory";
import { SidePanelViewController } from "../../../controllers/SidePanelViewController";
import { DimensionController } from "../../../controllers/DimensionController";

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
      activeItem: SidePanelViewController.MenuSelection.TEAM,
      iconSpirit: "heart outline",
      iconTeam: "user",
      iconWTF: "lightning",
      iconCircuit: "compass outline",
      iconNotifications: "bell outline"
    };
    this.myController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.CONSOLE_SIDEBAR
    );
  }

  /**
   * called when the sidebar is created in the view and will render
   */
  componentDidMount = () => {
    this.myController.configurePulseListener(this, this.onPulse);
    this.myController.configureHeartbeatListener(this, this.onHeartbeat);
    this.myController.configureMenuListener(this, this.onRefresh);
    this.myController.configureCircuitStartStopListener(
      this,
      this.onCircuitStartStop
    );
    this.myController.configureSidebarShowListener(this, this.onSidebarShow);
  };

  /**
   * called when we remove the console sidebar panel and menu from view
   */
  componentWillUnmount = () => {
    this.myController.configureHeartbeatListener(this, null);
    this.myController.configurePulseListener(this, null);
    this.myController.configureMenuListener(this, null);
    this.myController.configureCircuitStartStopListener(this, null);
    this.myController.configureSidebarShowListener(this, null);
  };

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

  onCircuitStartStop(event, arg) {
    this.setState({
      isAlarm: arg > 0
    });
  }

  onSidebarShow(event, arg) {
    console.log(this.name + " shortcut recieved -> sidebar show : " + arg);
    switch (arg) {
      case 1:
        this.selectItem(SidePanelViewController.MenuSelection.TEAM);
        break;
      case 2:
        this.selectItem(SidePanelViewController.MenuSelection.CIRCUITS);
        break;
      case 3:
        this.selectItem(SidePanelViewController.MenuSelection.SPIRIT);
        break;
      case 4:
        this.selectItem(SidePanelViewController.MenuSelection.NOTIFICATIONS);
        break;
      case 0:
        this.selectItem(SidePanelViewController.MenuSelection.WTF);
        break;
      default:
        throw new Error("Unknown console sidebar show arg " + arg);
    }
  }

  /**
   * function handler that os called when the console layout perspective changes
   */
  onRefresh() {
    let activeMenuItem = this.myController.activeMenuSelection;
    let state = {
      activeItem: activeMenuItem,
      iconSpirit: "heart",
      iconTeam: "user",
      iconWTF: "lightning",
      iconNotifications: "bell",
      iconCircuit: "compass"
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
      case SidePanelViewController.MenuSelection.NOTIFICATIONS:
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
   * called when we delect a menu ite,. This should close the panel
   */
  deselectItem = () => {
    this.myController.hidePanel();
  };

  /**
   * called when we select a new console menu item
   * @param name
   */
  selectItem = name => {
    if (name === SidePanelViewController.MenuSelection.WTF) {
      this.myController.startWTF();
    } else {
      this.myController.showPanel(name);
    }
  };

  /**
   * event click handler for the menu
   * @param e
   * @param name
   */
  handleItemClick = (e, { name }) => {
    if (this.state.activeItem === name) {
      this.deselectItem(name);
    } else {
      this.selectItem(name);
    }
  };

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

    let iconClassName = isOnline ? "signal" : "remove circle",
      menuClassName = isOnline ? "networkConnect" : "networkConnectError",
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
    const popupContent = (
      <div>
        <div>
          <i>{server}</i>
        </div>
        <div>
          <i>ping: </i>
          <b>
            <i>{pingTime <= 0 ? "calculating..." : pingTime + "ms"}</i>
          </b>
        </div>
        <Divider />
        <div>
          <i>{talkUrl}</i>
        </div>
        <div>
          <i>latency: </i>
          <b>
            <i>{latencyTime <= 0 ? "calculating..." : latencyTime + "ms"}</i>
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
    return (
      <div id="component" className={ConsoleSidebar.className}>
        <Menu
          inverted
          icon
          vertical
          style={{ height: DimensionController.getConsoleSidebarHeight() }}
        >
          <Menu.Item
            name={SidePanelViewController.MenuSelection.TEAM}
            active={activeItem === SidePanelViewController.MenuSelection.TEAM}
            onClick={this.handleItemClick}
          >
            <Icon name={this.state.iconTeam} />
          </Menu.Item>
          <Menu.Item
            name={SidePanelViewController.MenuSelection.CIRCUITS}
            active={
              activeItem === SidePanelViewController.MenuSelection.CIRCUITS
            }
            onClick={this.handleItemClick}
          >
            <Icon name={this.state.iconCircuit} />
          </Menu.Item>
          <Menu.Item
            name={SidePanelViewController.MenuSelection.SPIRIT}
            active={activeItem === SidePanelViewController.MenuSelection.SPIRIT}
            onClick={this.handleItemClick}
          >
            <Icon name={this.state.iconSpirit} />
          </Menu.Item>
          <Menu.Item
            name={SidePanelViewController.MenuSelection.NOTIFICATIONS}
            active={
              activeItem === SidePanelViewController.MenuSelection.NOTIFICATIONS
            }
            onClick={this.handleItemClick}
          >
            <Icon name={this.state.iconNotifications} />
          </Menu.Item>
          <Menu.Item
            name={SidePanelViewController.MenuSelection.WTF}
            active={activeItem === SidePanelViewController.MenuSelection.WTF}
            onClick={this.handleItemClick}
            className={this.state.isAlarm ? ConsoleSidebar.alarmClassName : ""}
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
