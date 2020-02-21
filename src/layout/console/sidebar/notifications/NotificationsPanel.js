import React, { Component } from "react";
import { Menu, Segment, Transition } from "semantic-ui-react";
import { DimensionController } from "../../../../controllers/DimensionController";
import { SidePanelViewController } from "../../../../controllers/SidePanelViewController";
import { RendererControllerFactory } from "../../../../controllers/RendererControllerFactory";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class NotificationsPanel extends Component {
  /**
   * the graphical name of this component in the DOM
   * @type {string}
   */
  static className = "notificationsContent";

  /**
   * builds the team panel for the renderer
   * @param props
   */
  constructor(props) {
    super(props);
    this.state = this.loadState();
    this.name = "[NotificationsPanel]";
    this.myController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.CONSOLE_SIDEBAR
    );
  }

  /**
   * loads the stored state from parent or use default values
   * @returns {{animationDelay: number, title: string, animationType: string}|*}
   */
  loadState() {
    let state = this.props.loadStateCb();
    if (!state) {
      return {
        activeItem: SidePanelViewController.SubmenuSelection.NOTIFICATIONS,
        notificationsVisible: false,
        animationType: SidePanelViewController.AnimationTypes.FLY_DOWN,
        animationDelay: SidePanelViewController.AnimationDelays.SUBMENU,
        title: ""
      };
    }
    return state;
  }

  /**
   * stores this components state in the parents state
   * @param state
   */
  saveState(state) {
    this.props.saveStateCb(state);
  }

  /**
   * attach our listeners to this component from our controller class
   */
  componentDidMount = () => {
    this.myController.configureNotificationsPanelListener(
      this,
      this.onRefreshNotificationsPanel
    );
    this.onRefreshNotificationsPanel();
  };

  /**
   * detach any listeners when we remove this from view
   */
  componentWillUnmount = () => {
    this.myController.configureNotificationsPanelListener(this, null);
  };

  /**
   * called when refreshing the view which is triggered by any perspective
   * change by an event or menu
   */
  onRefreshNotificationsPanel() {
    switch (this.myController.activeNotificationsSubmenuSelection) {
      case SidePanelViewController.SubmenuSelection.NOTIFICATIONS:
        this.showNotificationsPanel();
        break;
      default:
        throw new Error("Unknown notifications panel menu item");
    }
  }

  /**
   * display the notification panel in the sidebar panel
   */
  showNotificationsPanel() {
    this.setState({
      activeItem: SidePanelViewController.SubmenuSelection.NOTIFICATIONS,
      notificationsVisible: true
    });
  }

  /**
   * updates display to show spirit content
   * @param e
   * @param name
   */
  handleNotificationsClick = (e, { name }) => {
    this.setState({
      activeItem: name,
      notificationsVisible: true
    });
  };

  /**
   * determines if we are currently linked to another team member
   * @param memberId
   * @returns {boolean}
   */
  isLinked = memberId => {
    return this.spiritModel.isLinked(memberId);
  };

  /**
   * gets the badges content panel for the sidebar
   * @returns {*}
   */
  getNotificationsContent = () => {
    return (
      <div className={NotificationsPanel.className}>
        <i>No notifications, check back later :)</i>
      </div>
    );
  };
  /**
   * renders the console sidebar panel of the console view
   * @returns {*}
   */
  render() {
    return (
      <div
        id="component"
        className="consoleSidebarPanel notificationsPanel"
        style={{
          width: this.props.width,
          opacity: this.props.opacity
        }}
      >
        <Segment.Group>
          <Menu size="mini" inverted pointing secondary>
            <Menu.Item
              name="notifications"
              active={true}
              onClick={this.handleNotificationsClick}
            />
          </Menu>
          <Segment
            inverted
            style={{ height: DimensionController.getSidebarPanelHeight() }}
          >
            <Transition
              visible={this.state.notificationsVisible}
              animation={this.state.animationType}
              duration={this.state.animationDelay}
              unmountOnHide
            >
              {this.getNotificationsContent()}
            </Transition>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}
