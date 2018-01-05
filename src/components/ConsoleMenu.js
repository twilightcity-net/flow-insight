import React, { Component } from "react";
import { RendererEvent } from "../RendererEventManager";
import { RendererEventManagerHelper } from "../RendererEventManagerHelper";
import { Icon, Menu } from "semantic-ui-react";

//
// this component is the tab panel wrapper for the console content
//
export default class ConsoleMenu extends Component {
  constructor(props) {
    super(props);
    this.activeItem = "journal";
    this.state = {
      activeItem: "journal"
    };
    this.events = {
      hideConsole: new RendererEvent(
        RendererEventManagerHelper.Events.WINDOW_CONSOLE_SHOW_HIDE,
        this
      )
    };
  }

  handleMenuClick = (e, { name }) => {
    this.setState({ activeItem: name });
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
    const { activeItem } = this.state;
    return (
      <div id="component" className="consoleMenu">
        <Menu size="tiny" inverted>
          <Menu.Item header className="networkConnect">
            <Icon name="signal" color="green" />
          </Menu.Item>
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
