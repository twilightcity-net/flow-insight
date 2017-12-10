import React, { Component } from "react";
import { Icon, Menu } from "semantic-ui-react";

/*
 * this component is the tab panel wrapper for the console content
 */
export default class ConsoleMenu extends Component {
  constructor(props) {
    super(props);
    this.activeItem = "journal";
    this.state = {
      activeItem: "journal"
    };
  }

  handleMenuClick = (e, { name }) => {
    this.setState({ activeItem: name });
  };

  handleHideClick = (e, { name }) => {
    console.log("[ConsoleTabs] open hide window");
  };

  handleUndockClick = (e, { name }) => {
    console.log("[ConsoleTabs] open undock window");
  };

  handleSettingsClick = (e, { name }) => {
    console.log("[ConsoleTabs] open settings window");
  };

  /*
   * renders the tab component of the console view
   */
  render() {
    const { activeItem } = this.state;
    return (
      <div id="component" className="consoleMenu">
        <Menu size="tiny" inverted>
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
            name="torchie"
            color="violet"
            active={activeItem === "torchie"}
            onClick={this.handleMenuClick}
          >
            <Icon name="heart" size="large" />
            Torchie
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
          <Menu.Menu position="right">
            <Menu.Item name="hide" onClick={this.handleHideClick}>
              <Icon name="toggle up" size="large" />
            </Menu.Item>
            <Menu.Item name="undock" onClick={this.handleUndockClick}>
              <Icon name="window restore" size="large" />
            </Menu.Item>
            <Menu.Item name="settings" onClick={this.handleSettingsClick}>
              <Icon name="settings" size="large" />
            </Menu.Item>
          </Menu.Menu>
        </Menu>
      </div>
    );
  }
}
