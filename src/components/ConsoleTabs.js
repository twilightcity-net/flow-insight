import React, { Component } from "react";
import { Menu, Icon, Segment } from "semantic-ui-react";

/*
 * this component is the tab panel wrapper for the console content
 */
export default class ConsoleTabs extends Component {
  constructor(props) {
    super(props);
    this.bounds = this.getBounds();
    this.activeItem = this.state = {
      activeItem: "journal"
    };
  }

  getBounds() {
    return {
      width: window.innerWidth,
      height: window.innerHeight
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
      <div id="wrapper" className="consoleTabs">
        <div id="wrapper" className="segment">
          <Segment.Group>
            <Segment inverted>
              Ut vulputate sodales quam eu consequat. Vestibulum ante ipsum
              primis in faucibus orci luctus et ultrices posuere cubilia Curae.
            </Segment>
            <Segment inverted>
              Etiam non lectus in est finibus posuere. Fusce nisl lorem,
              hendrerit eget lorem a
            </Segment>
            <Segment inverted>
              Mauris laoreet scelerisque ipsum eget tristique.
            </Segment>
            <Segment inverted>
              Curabitur maximus enim vitae mauris ultrices, sed posuere ipsum
              fringilla.
            </Segment>
          </Segment.Group>
        </div>
        <div id="wrapper" className="menu">
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
      </div>
    );
  }
}
