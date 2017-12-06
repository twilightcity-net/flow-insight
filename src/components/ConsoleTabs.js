import React, { Component } from "react";
import { Menu, Icon, Input } from "semantic-ui-react";

/*
 * this component is the tab panel wrapper for the console content
 */
export default class ConsoleTabs extends Component {
  constructor(props) {
    super(props);
    this.activeItem = this.state = {
      activeItem: "journal"
    };
  }

  state = {};

  handleMenuClick = (e, { name }) => {
    this.setState({ activeItem: name });
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
      <div id="wrapper" className="tabs">
        <Menu inverted>
          <Menu.Item
            name="journal"
            active={activeItem === "journal"}
            onClick={this.handleMenuClick}
          >
            <Icon name="book" size="large" />
            Journal
          </Menu.Item>
          <Menu.Item
            name="torchie"
            active={activeItem === "torchie"}
            onClick={this.handleMenuClick}
          >
            <Icon name="heart" size="large" />
            Torchie
          </Menu.Item>
          <Menu.Item
            name="flow"
            active={activeItem === "flow"}
            onClick={this.handleMenuClick}
          >
            <Icon name="random" size="large" />
            Flow
          </Menu.Item>
          <Menu.Menu position="right">
            <Menu.Item name="hide" onClick={this.handleSettingsClick}>
              <Icon name="toggle up" size="large" />
            </Menu.Item>
            <Menu.Item name="undock" onClick={this.handleSettingsClick}>
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
