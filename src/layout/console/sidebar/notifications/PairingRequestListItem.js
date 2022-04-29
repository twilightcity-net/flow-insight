import React, {Component} from "react";
import {Icon, Label, List, Popup,} from "semantic-ui-react";
import {FervieClient} from "../../../../clients/FervieClient";
import {NotificationClient} from "../../../../clients/NotificationClient";

export default class PairingRequestListItem extends Component {
  constructor(props) {
    super(props);
    this.wtfTimer = null;

  }


  /**
   * renders our popup content for our GUI to display to the user
   * @param trigger
   * @returns {*}
   */
  getPopupContent(trigger) {
    let teamMemberName =  this.props.model.data.fromDisplayName;

    let message = teamMemberName + " would like to pair with you.";
    if (this.props.model.canceled) {
      message = teamMemberName + " canceled the pairing request.";
    }

    let popupContent = (
      <div>
        <div>
          <div>
            <b>Pairing Request</b>
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

    let fromMemberId = this.props.model.data.fromMemberId;
    let toMemberId = this.props.model.data.toMemberId
    FervieClient.confirmPairingLink(fromMemberId, toMemberId, this, (arg) => {
      if (arg.error) {
        console.error("Unable to confirm pairing link");
      } else {
        console.log("confirm pairing returned!");
        NotificationClient.deleteNotification(this.props.model.id, this, (arg) => {
          if (arg.error) {
            console.error("Unable to delete notification");
          } else {
            this.props.refresh();
          }
        });
      }
    });

  }

  render() {
    let fullName = "Team Member";
    if (this.props.model && this.props.model.data) {
      fullName = this.props.model.data.fromFullName;
    }
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
      button = (<Label color="violet" onClick={this.handleConfirmClick}>
                <span>
                  Confirm
                </span>
            </Label>);
    } else {
      button = (<Label color="grey">
                <span className={canceledClass}>
                  Canceled
                </span>
      </Label>);
    }



    return this.getPopupContent(
      <List.Item
        className={"notificationItem" + unreadClass + canceledClass}
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
            Pairing Request
          </List.Header>
          <i className={"name" + canceledClass}>
            ({fullName})
          </i>
        </List.Content>
      </List.Item>
    );
  }
}
