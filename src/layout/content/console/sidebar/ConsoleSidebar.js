import React, {Component} from "react";
import {Divider, Icon, Menu, Popup} from "semantic-ui-react";
import {ActiveViewControllerFactory} from "../../../../controllers/ActiveViewControllerFactory";
import {SidePanelViewController} from "../../../../controllers/SidePanelViewController";
import {DimensionController} from "../../../../controllers/DimensionController";

/**
 * this component is the sidebar to the console. This animates a slide.
 * @type{ConsoleSidebar}
 */
export default class ConsoleSidebar extends Component {
  static className = "consoleSidebar";

  /**
   * builds the console sidebar and panel with given properties
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ConsoleSidebar]";
    this.state = {
      activeItem: SidePanelViewController.MenuSelection.TEAM,
      iconSpirit: "heart outline",
      iconTeam: "user",
      iconWTF: "lightning",
      iconCircuit: "compass outline",
      iconNotifications: "bell outline"
    };
    this.myController = ActiveViewControllerFactory.getViewController(
      ActiveViewControllerFactory.Views.SIDE_PANEL
    );
  }

  /**
   * called when the sidebar is created in the view and will render
   */
  componentDidMount = () => {
    this.myController.configurePulseListener(this, this.onPulse);
    this.myController.configureHeartbeatListener(this, this.onHeartbeat);
    this.myController.configureMenuListener(this, this.onRefresh);
  };

  /**
   * called when we remove the console sidebar panel and menu from view
   */
  componentWillUnmount = () => {
    this.myController.configureHeartbeatListener(this, null);
    this.myController.configurePulseListener(this, null);
    this.myController.configureMenuListener(this, null);
  };

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

  onPulse(event, arg) {
    this.setState({
      latencyTime: arg.latencyTime
    });
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
      case SidePanelViewController.MenuSelection.SPIRIT:
        state.iconTeam += oStr;
        state.iconCircuit += oStr;
        state.iconNotifications += oStr;
        break;
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
      console.log("load /circuit/wtf in browser");
    }
    else {
      this.myController.showPanel(name);
    }
  };

  /**
   * event click handler for the menu
   * @param e
   * @param name
   */
  handleItemClick = (e, {name}) => {
    if (this.state.activeItem === name) {
      this.deselectItem(name);
    }
    else {
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
      <Menu.Item
        header
        className={menuClassName}
      >
        <Icon
          name={iconClassName}
          color={iconColor}
        />
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
        <Divider/>
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
            <i style={{color: "red"}}>
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
          style={{height: DimensionController.getConsoleSidebarHeight()}}
        >
          <Menu.Item
            name={SidePanelViewController.MenuSelection.TEAM}
            active={
              activeItem === SidePanelViewController.MenuSelection.TEAM
            }
            onClick={this.handleItemClick}
          >
            <Icon name={this.state.iconTeam}/>
          </Menu.Item>
          <Menu.Item
            name={SidePanelViewController.MenuSelection.SPIRIT}
            active={activeItem === SidePanelViewController.MenuSelection.SPIRIT}
            onClick={this.handleItemClick}
          >
            <Icon name={this.state.iconSpirit}/>
          </Menu.Item>
          <Menu.Item
            name={SidePanelViewController.MenuSelection.CIRCUITS}
            active={
              activeItem === SidePanelViewController.MenuSelection.CIRCUITS
            }
            onClick={this.handleItemClick}
          >
            <Icon name={this.state.iconCircuit}/>
          </Menu.Item>
          <Menu.Item
            name={SidePanelViewController.MenuSelection.NOTIFICATIONS}
            active={
              activeItem === SidePanelViewController.MenuSelection.NOTIFICATIONS
            }
            onClick={this.handleItemClick}
          >
            <Icon name={this.state.iconNotifications}/>
          </Menu.Item>
          <Menu.Item
            name={SidePanelViewController.MenuSelection.WTF}
            active={
              activeItem === SidePanelViewController.MenuSelection.WTF
            }
            onClick={this.handleItemClick}
          >
            <Icon name={this.state.iconWTF}/>
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
