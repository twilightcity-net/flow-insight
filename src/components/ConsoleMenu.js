import React, { Component } from "react";
import { RendererEventFactory } from "../RendererEventFactory";
import { Icon, Menu, Popup } from "semantic-ui-react";

//
// this component is the tab panel wrapper for the console content
//
export default class ConsoleMenu extends Component {
  constructor(props) {
    super(props);
    this.isChanging = false;
    this.animationTime = this.props.animationTime + 50;
    this.state = {
      activeItem: "troubleshoot",
      isOnline: true,
      pingTime: 0,
      server: "identifying...",
      errorMsg: ""
    };
    this.isOnline = true;
    this.events = {
      hideConsole: RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_CONSOLE_SHOW_HIDE,
        this
      ),
      consoleMenuChange: RendererEventFactory.createEvent(
        RendererEventFactory.Events.VIEW_CONSOLE_MENU_CHANGE,
        this
      ),
      heartbeat: RendererEventFactory.createEvent(
        RendererEventFactory.Events.APP_HEARTBEAT,
        this,
        this.onHeartbeatCb
      )
    };
  }

  onHeartbeatCb(event, arg) {
    console.log(arg);
    this.setState({
      isOnline: arg.isOnline,
      pingTime: arg.pingTime,
      server: arg.server,
      errorMsg: arg.message
    });
  }

  handleMenuClick = (e, { name }) => {
    if (this.isChanging || this.state.activeItem === name) return;
    this.isChanging = true;
    this.events.consoleMenuChange.dispatch({
      old: this.state.activeItem,
      new: name
    });
    this.setState({ activeItem: name });
    setTimeout(() => {
      this.isChanging = false;
    }, this.animationTime);
  };

  handleHideClick = (e, { name }) => {
    console.log("[ConsoleMenu] open hide window");
    this.events.hideConsole.dispatch(0, true);
  };

  handleUndockClick = (e, { name }) => {
    console.log("[ConsoleMenu] open undock window");
  };

  handleSettingsClick = (e, { name }) => {
    console.log("[ConsoleMenu] open settings window");
  };

  /// renders the menu component of the console view
  render() {
    const { activeItem, isOnline, pingTime, server, errorMsg } = this.state;
    const networkConnectMenuItem = (
      <Menu.Item
        header
        className={isOnline ? "networkConnect" : "networkConnectError"}
      >
        <Icon
          name={isOnline ? "signal" : "remove circle"}
          color={isOnline ? "green" : "red"}
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
      <div id="component" className="consoleMenu">
        <Menu size="tiny" inverted>
          <Popup
            trigger={networkConnectMenuItem}
            className="chunkTitle"
            content={popupContent}
            position="top left"
            offset={-2}
            inverted
          />
          <Menu.Item
            name="journal"
            color="violet"
            active={activeItem === "journal"}
            onClick={this.handleMenuClick}
          >
            <Icon name="book" size="large" />
            Journal
          </Menu.Item>
          <Menu.Item
            name="troubleshoot"
            color="violet"
            active={activeItem === "troubleshoot"}
            onClick={this.handleMenuClick}
          >
            <Icon name="lightning" size="large" />
            Troubleshoot
          </Menu.Item>
          <Menu.Item
            name="flow"
            color="violet"
            active={activeItem === "flow"}
            onClick={this.handleMenuClick}
          >
            <Icon name="random" size="large" />
            Flow
          </Menu.Item>
          <Menu.Item
            name="projects"
            color="violet"
            active={activeItem === "projects"}
            onClick={this.handleMenuClick}
            disabled
          >
            <Icon name="cubes" size="large" />
            Projects
          </Menu.Item>
          <Menu.Item
            name="circles"
            color="violet"
            active={activeItem === "circles"}
            onClick={this.handleMenuClick}
            disabled
          >
            <Icon name="users" size="large" />
            Circles
          </Menu.Item>
          <Menu.Menu position="right">
            <Menu.Item name="hide" onClick={this.handleHideClick}>
              <Icon name="toggle up" size="large" />
            </Menu.Item>
            <Menu.Item name="undock" onClick={this.handleUndockClick} disabled>
              <Icon name="window restore" size="large" />
            </Menu.Item>
            <Menu.Item
              name="settings"
              onClick={this.handleSettingsClick}
              disabled
            >
              <Icon name="settings" size="large" />
            </Menu.Item>
          </Menu.Menu>
        </Menu>
      </div>
    );
  }
}
