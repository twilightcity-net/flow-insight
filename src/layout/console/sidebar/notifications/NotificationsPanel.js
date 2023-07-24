import React, {Component} from "react";
import {List, Menu, Segment, Transition,} from "semantic-ui-react";
import {DimensionController} from "../../../../controllers/DimensionController";
import {SidePanelViewController} from "../../../../controllers/SidePanelViewController";
import {RendererControllerFactory} from "../../../../controllers/RendererControllerFactory";
import PairingRequestListItem from "./PairingRequestListItem";
import {NotificationClient} from "../../../../clients/NotificationClient";
import {RendererEventFactory} from "../../../../events/RendererEventFactory";
import WTFThresholdListItem from "./WTFThresholdListItem";
import BuddyRequestListItem from "./BuddyRequestListItem";
import OfflineChatListItem from "./OfflineChatListItem";
import CircuitNotificationListItem from "./CircuitNotificationListItem";

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
   * builds the notification panel for the renderer
   * @param props
   */
  constructor(props) {
    super(props);
    this.state = this.loadState();
    this.name = "[NotificationsPanel]";
    this.myController =
      RendererControllerFactory.getViewController(
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
        activeItem:
          SidePanelViewController.SubmenuSelection.NOTIFICATIONS,
        notificationsVisible: false,
        animationType:
          SidePanelViewController.AnimationTypes.FLY_DOWN,
        animationDelay:
          SidePanelViewController.AnimationDelays.SUBMENU,
        title: "",
        notifications: [],
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

    this.notificationReadUpdate =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.VIEW_CONSOLE_NOTIFICATION_READ_UPDATE,
        this
      );

    this.refreshNotificationsListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.NOTIFICATION_DATA_REFRESH,
        this,
        this.refreshNotifications
      );
  };

  /**
   * detach any listeners when we remove this from view
   */
  componentWillUnmount = () => {
    this.myController.configureNotificationsPanelListener(
      this,
      null
    );

    this.notificationReadUpdate.clear();
    this.refreshNotificationsListener.clear();
  };


  /**
   * called when refreshing the view which is triggered by any perspective
   * change by an event or menu
   */
  onRefreshNotificationsPanel() {
    switch (
      this.myController.activeNotificationsSubmenuSelection
    ) {
      case SidePanelViewController.SubmenuSelection.NOTIFICATIONS:
        this.showNotificationsPanel();
        break;
      default:
        throw new Error(
          "Unknown notifications panel menu item"
        );
    }
  }

  /**
   * display the notification panel in the sidebar panel
   */
  showNotificationsPanel() {
    console.log("show notifications!");
    this.setState({
      activeItem:
        SidePanelViewController.SubmenuSelection.NOTIFICATIONS,
      notificationsVisible: true,
    });

    this.refreshNotifications();
  }

  /**
   * updates display to show notification content
   * @param e
   * @param name
   */
  handleNotificationsClick = (e, { name }) => {
    this.setState({
      activeItem: name,
      notificationsVisible: true,
    });
  };

  refreshNotifications = () => {
    let that = this;
    NotificationClient.getNotifications(this, (arg) => {
      if (arg.error) {
        console.error(
          "Unable to load notifications, " + arg.error
        );
      } else {
        that.setState({
          notifications: arg.data,
        });
      }
    });

    NotificationClient.markAllAsRead(this, (arg) => {
      if (arg.error) {
        console.error(
          "Unable to mark notifications as read, " +
            arg.error
        );
      } else {
        that.notificationReadUpdate.dispatch({});
      }
    });
  };

  /**
   * gets the notification content panel for the sidebar
   * @returns {*}
   */
  getNotificationsContent = () => {
    let notificationCount = this.state.notifications.length;

    console.log("notification count =" + notificationCount);
    let content = "";

    if (notificationCount > 0) {
      content = (
        <div className="notificationsContent">
          <List
            inverted
            divided
            celled
            animated
            verticalAlign="middle"
            size="large"
          >
            {this.state.notifications.map(
              (notification, i) => {

                console.log(notification);

                if (notification.type === "PAIRING_REQUEST") {
                  return (<PairingRequestListItem
                    key={i}
                    id={i}
                    model={notification}
                    refresh={this.refreshNotifications}
                  />);
                } else if (notification.type === "TEAM_WTF_THRESHOLD") {
                  return (<WTFThresholdListItem
                    key={i}
                    id={i}
                    model={notification}
                    refresh={this.refreshNotifications}
                  />);
                } else if (notification.type === "BUDDY_CONFIRMATION_REQUEST") {
                  return (<BuddyRequestListItem
                    key={i}
                    id={i}
                    model={notification}
                    refresh={this.refreshNotifications}
                  />);
                } else if (notification.type === "CHAT") {
                    return (<OfflineChatListItem
                      key={i}
                      id={i}
                      model={notification}
                      refresh={this.refreshNotifications}
                    />);
                } else if (notification.type === "CIRCUIT_NOTIFICATION") {
                  return (<CircuitNotificationListItem
                    key={i}
                    id={i}
                    model={notification}
                    refresh={this.refreshNotifications}
                  />);
                } else {
                  console.error("Unknown notification type! "+notification.type);
                }

                return "";
              }
            )}
          </List>
        </div>
      );
    } else {
      content = (
        <div className={NotificationsPanel.className}>
          <i>No notifications, check back later :)</i>
        </div>
      );
    }

    return content;
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
          opacity: this.props.opacity,
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
            style={{
              height:
                DimensionController.getSidebarPanelHeight(),
            }}
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
