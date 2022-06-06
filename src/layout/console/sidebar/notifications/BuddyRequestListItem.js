import React, {Component} from "react";
import {Label, List, Popup,} from "semantic-ui-react";
import {FervieClient} from "../../../../clients/FervieClient";
import {NotificationClient} from "../../../../clients/NotificationClient";

export default class BuddyRequestListItem extends Component {
  constructor(props) {
    super(props);
    this.wtfTimer = null;
  }

  getDisplayName() {
    const fromFervie = this.props.model.data.fromFervieName;
    const fromUsername = this.props.model.data.fromUsername;

    let displayName;
    if (fromFervie) {
      displayName = fromFervie;
    } else {
      displayName = "@" + fromUsername;
    }

    return displayName;
  }

  /**
   * renders our popup content for our GUI to display to the user
   * @param trigger
   * @returns {*}
   */
  getPopupContent(trigger) {

    const displayName = this.getDisplayName();

    let message =
      displayName + " would like to be your buddy.";
    if (this.props.model.canceled) {
      message =
        displayName + " canceled the buddy request.";
    }

    let popupContent = (
      <div>
        <div>
          <div>
            <b>Buddy Request</b>
          </div>
          <div>
            <i>{message}</i>
          </div>
        </div>
      </div>
    );

    return (
      <Popup
        trigger={trigger}
        className="chunkTitle"
        content={popupContent}
        position="right center"
        inverted
        hideOnScroll
      />
    );
  }

  handleConfirmClick = () => {
    console.log("Confirm clicked!");

    const fromMemberId = this.props.model.data.fromMemberId;
    const requestId = this.props.model.data.buddyRequestId;

    FervieClient.confirmBuddyLink(
      fromMemberId,
      requestId,
      this,
      (arg) => {
        if (arg.error) {
          console.error("Unable to confirm buddy link: "+arg.error);
        } else {
          console.log("confirm buddy returned!");
          NotificationClient.deleteNotification(
            this.props.model.id,
            this,
            (arg) => {
              if (arg.error) {
                console.error(
                  "Unable to delete notification"
                );
              } else {
                this.props.refresh();
              }
            }
          );
        }
      }
    );
  };

  render() {
    let displayName = this.getDisplayName();

    let unreadClass = "";
    if (!this.props.model.read) {
      unreadClass = " unread";
    }

    let canceledClass = "";
    if (this.props.model.canceled) {
      canceledClass = " canceled";
    }

    let button = "";
    if (!this.props.model.canceled) {
      button = (
        <Label
          color="violet"
          onClick={this.handleConfirmClick}
        >
          <span>Confirm</span>
        </Label>
      );
    } else {
      button = (
        <Label color="grey">
          <span className={canceledClass}>Canceled</span>
        </Label>
      );
    }

    return this.getPopupContent(
      <List.Item
        className={
          "notificationItem" + unreadClass + canceledClass
        }
        key={this.props.id}
      >
        <List.Content
          floated="right"
          verticalAlign="middle"
          className="actionButton"
        >
          {button}
        </List.Content>
        <List.Content>
          <List.Header className={canceledClass}>
            Buddy Request
          </List.Header>
          <i className={"name" + canceledClass}>
            ({displayName})
          </i>
        </List.Content>
      </List.Item>
    );
  }
}
