import React, { Component } from "react";
import { Icon, Label, Menu } from "semantic-ui-react";

//
// this component is the sidebar to the console. This animates a slide.
//
export default class ConsoleSidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeItem: "",
      iconProfile: "heart outline",
      iconMessages: "talk outline",
      iconNotifications: "bell outline"
    };
  }

  /// performs a simple calculation for dynamic height of menu
  calculateMenuHeight() {
    let heights = {
      rootBorder: 2,
      bottomMenuHeight: 28
    };

    return window.innerHeight - heights.rootBorder - heights.bottomMenuHeight;
  }

  handleItemProfileClick = (e, { name }) => {
    this.setState({
      activeItem: name,
      iconProfile: "heart",
      iconMessages: "talk outline",
      iconNotifications: "bell outline"
    });
  };

  handleItemMessagesClick = (e, { name }) => {
    this.setState({
      activeItem: name,
      iconProfile: "heart outline",
      iconMessages: "talk",
      iconNotifications: "bell outline"
    });
  };

  handleItemNotificationsClick = (e, { name }) => {
    this.setState({
      activeItem: name,
      iconProfile: "heart outline",
      iconMessages: "talk outline",
      iconNotifications: "bell"
    });
  };

  /// renders the sidebar of the console view
  render() {
    const { activeItem } = this.state;

    return (
      <div id="component" className="consoleSidebar">
        <Menu
          inverted
          icon
          vertical
          style={{ height: this.calculateMenuHeight() }}
        >
          <Menu.Item
            name="profile"
            active={activeItem === "profile"}
            onClick={this.handleItemProfileClick}
          >
            <Icon name={this.state.iconProfile}>
              {false && (
                <Label color="red" floating size="mini">
                  !
                </Label>
              )}
            </Icon>
          </Menu.Item>
          <Menu.Item
            name="messages"
            active={activeItem === "messages"}
            onClick={this.handleItemMessagesClick}
          >
            <Icon name={this.state.iconMessages}>
              {false && (
                <Label color="red" floating size="mini">
                  7
                </Label>
              )}
            </Icon>
          </Menu.Item>
          <Menu.Item
            name="notifications"
            active={activeItem === "notifications"}
            onClick={this.handleItemNotificationsClick}
          >
            <Icon name={this.state.iconNotifications}>
              {false && (
                <Label color="red" floating size="mini">
                  23
                </Label>
              )}
            </Icon>
          </Menu.Item>
        </Menu>
      </div>
    );
  }
}
