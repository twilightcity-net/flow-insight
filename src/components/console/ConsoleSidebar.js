import React, { Component } from "react";
import { Icon, Menu } from "semantic-ui-react";
import { ActiveViewControllerFactory } from "../../controllers/ActiveViewControllerFactory";
import { SidePanelViewController } from "../../controllers/SidePanelViewController";

/**
 * this component is the sidebar to the console. This animates a slide.
 */
export default class ConsoleSidebar extends Component {
  /**
   * builds the console sidebar and panel with given properties
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ConsoleSidebar]";

    this.state = {
      activeItem: SidePanelViewController.MenuSelection.SPIRIT,
      iconProfile: "heart",
      iconMessages: "user outline",
      iconCircuit: "compass outline",
      iconNotifications: "bell outline"
    };

    this.myController = ActiveViewControllerFactory.createViewController(
      ActiveViewControllerFactory.Views.SIDE_PANEL
    );
  }

  /**
   * called when the sidebar is created in the view and will render
   */
  componentDidMount = () => {
    this.myController.configureMenuListener(
      this,
      this.onRefreshActivePerspective
    );
  };

  /**
   * called when we remove the console sidebar panel and menu from view
   */
  componentWillUnmount = () => {
    this.myController.configureMenuListener(this, null);
  };

  /**
   * function handler that os called when the console layout perspective changes
   */
  onRefreshActivePerspective() {
    let activeMenuItem = this.myController.activeMenuSelection;
    let state = {
      activeItem: activeMenuItem,
      iconProfile: "heart",
      iconMessages: "user",
      iconNotifications: "bell",
      iconCircuit: "compass"
    };
    let oStr = " outline";
    switch (activeMenuItem) {
      case SidePanelViewController.MenuSelection.SPIRIT:
        state.iconMessages += oStr;
        state.iconNotifications += oStr;
        state.iconCircuit += oStr;
        break;
      case SidePanelViewController.MenuSelection.MESSAGES:
        state.iconProfile += oStr;
        state.iconNotifications += oStr;
        state.iconCircuit += oStr;
        break;
      case SidePanelViewController.MenuSelection.CIRCUITS:
        state.iconProfile += oStr;
        state.iconMessages += oStr;
        state.iconNotifications += oStr;
        break;
      case SidePanelViewController.MenuSelection.NOTIFICATIONS:
        state.iconProfile += oStr;
        state.iconMessages += oStr;
        state.iconCircuit += oStr;
        break;
      case SidePanelViewController.MenuSelection.NONE:
        state.iconProfile += oStr;
        state.iconMessages += oStr;
        state.iconCircuit += oStr;
        state.iconNotifications += oStr;
        break;
      default:
        break;
    }
    this.setState(state);
  }

  /**
   * performs a simple calculation for dynamic height of menu
   */
  calculateMenuHeight() {
    let heights = {
      rootBorder: 2,
      bottomMenuHeight: 28
    };

    return window.innerHeight - heights.rootBorder - heights.bottomMenuHeight;
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
    this.myController.showPanel(name);
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
            name={SidePanelViewController.MenuSelection.SPIRIT}
            active={activeItem === SidePanelViewController.MenuSelection.SPIRIT}
            onClick={this.handleItemClick}
          >
            <Icon name={this.state.iconProfile}>
              {/*<Label color="red" floating size="mini">*/}
              {/*  !*/}
              {/*</Label>*/}
            </Icon>
          </Menu.Item>
          <Menu.Item
            name={SidePanelViewController.MenuSelection.MESSAGES}
            active={
              activeItem === SidePanelViewController.MenuSelection.MESSAGES
            }
            onClick={this.handleItemClick}
          >
            <Icon name={this.state.iconMessages}>
              {/*<Label color="red" floating size="mini">*/}
              {/*  7*/}
              {/*</Label>*/}
            </Icon>
          </Menu.Item>
          <Menu.Item
            name={SidePanelViewController.MenuSelection.CIRCUITS}
            active={
              activeItem === SidePanelViewController.MenuSelection.CIRCUITS
            }
            onClick={this.handleItemClick}
          >
            <Icon name={this.state.iconCircuit}>
              {/*<Label color="red" floating size="mini">*/}
              {/*  7*/}
              {/*</Label>*/}
            </Icon>
          </Menu.Item>
          <Menu.Item
            name={SidePanelViewController.MenuSelection.NOTIFICATIONS}
            active={
              activeItem === SidePanelViewController.MenuSelection.NOTIFICATIONS
            }
            onClick={this.handleItemClick}
          >
            <Icon name={this.state.iconNotifications}>
              {/*<Label color="red" floating size="mini">*/}
              {/*  23*/}
              {/*</Label>*/}
            </Icon>
          </Menu.Item>
        </Menu>
      </div>
    );
  }
}
