import React, {Component} from "react";
import {List, Popup,} from "semantic-ui-react";
import {RendererControllerFactory} from "../../../../controllers/RendererControllerFactory";

export default class OfflineChatListItem extends Component {
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

  getComboDisplayName() {
    const fromFervie = this.props.model.data.fromFervieName;
    const fromUsername = this.props.model.data.fromUsername;

    let displayName;
    if (fromFervie) {
      displayName = fromFervie + " (@"+fromUsername+")";
    } else {
      displayName = "@" + fromUsername;
    }

    return displayName;
  }

  onClickNotification = () => {
    let dmPopoutController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.DM_POPOUT,
        this
      );

    dmPopoutController.openDMForMember(
      this.props.model.data.fromMemberId
    );

  }

  /**
   * renders our popup content for our GUI to display to the user
   * @param trigger
   * @returns {*}
   */
  getPopupContent(trigger) {

    const displayName = this.getComboDisplayName();

    let message = this.props.model.data.details.message;
      //displayName + " sent you a message while you were offline.";

    let popupContent = (
      <div>
        <div>
          <div>
            <b>{displayName}:</b>
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

  render() {
    let displayName = this.getDisplayName();

    let readClass = "";
    if (this.props.model.read) {
      readClass = " chat read";
    }

    let count = "";
    if (this.props.model.count > 0) {
      count = " ("+this.props.model.count + ")";
    }

    const item = (<List.Item
      className={
        "notificationItem" + readClass
      }
      onClick={this.onClickNotification}
    >
      <List.Content>
        <List.Header>
          Offline Message {count}
        </List.Header>
        <i className={"name"}>
          ({displayName})
        </i>
      </List.Content>
    </List.Item>);

    if (this.props.model.read) {
      return item;
    } else {
      return this.getPopupContent(
        item
      );
    }

  }
}
