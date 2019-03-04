import React, { Component } from "react";
import { RendererEventFactory } from "../RendererEventFactory";
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
      iconMessages: "user outline",
      iconNotifications: "bell outline"
    };
    this.events = {
      sidebarPanel: RendererEventFactory.createEvent(
        RendererEventFactory.Events.VIEW_CONSOLE_SIDEBAR_PANEL,
        this
      )
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

  deselectItem(name) {
    this.events.sidebarPanel.dispatch({
      content: name,
      show: 0
    });
    this.setState({
      activeItem: "",
      iconProfile: "heart outline",
      iconMessages: "user outline",
      iconNotifications: "bell outline"
    });
  }

  selectItem(name) {
    this.props.onChangeActiveSidePanel(name);

    this.events.sidebarPanel.dispatch({
      content: name,
      show: 1
    });
    let state = {
      activeItem: name,
      iconProfile: "heart",
      iconMessages: "user",
      iconNotifications: "bell"
    };
    switch (name) {
      case "profile":
        state.iconMessages += " outline";
        state.iconNotifications += " outline";
        break;
      case "messages":
        state.iconProfile += " outline";
        state.iconNotifications += " outline";
        break;
      case "notifications":
        state.iconProfile += " outline";
        state.iconMessages += " outline";
        break;
      default:
        break;
    }
    this.setState(state);
  }

  handleItemClick = (e, { name }) => {
    if (this.state.activeItem === name) {
      this.deselectItem(name);
    } else {
      this.selectItem(name);
    }
  };

  componentDidMount = () => {
    console.log("ConsoleSidebar : componentDidMount");

    this.selectItem("profile");
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
            onClick={this.handleItemClick}
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
            onClick={this.handleItemClick}
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
            onClick={this.handleItemClick}
            disabled
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
