import React, {Component} from "react";
import {Divider, Icon, List, Popup,} from "semantic-ui-react";
import {BaseClient} from "../../../../clients/BaseClient";
import UtilRenderer from "../../../../UtilRenderer";
import {RendererControllerFactory} from "../../../../controllers/RendererControllerFactory";
import FervieProfile from "../../../shared/FervieProfile";

/**
 * our list items that are displayed in our buddy panel.
 */
export default class BuddiesPanelListItem extends Component {

  constructor(props) {
    super(props);
    this.name = "[BuddiesPanelListItem]";
    this.state = {
    };
  }


  /**
   * gets our display name for our team panel list item
   * @returns {*}
   */
  getDisplayName() {
    let displayName = "";
    if (this.props.model.fervieName) {
      displayName = this.props.model.fervieName;
    } else {
      displayName = this.props.model.username;
    }
    return (
      <span>
        {displayName}
        {this.props.isMe && <i>{BaseClient.Strings.YOU}</i>}
      </span>
    );
  }


  /**
   * gets our icon for our buddy panel list item
   * @returns {*}
   */
  getOnlineIcon() {
    let name = "circle outline",
      color = "grey";

    if (UtilRenderer.isMemberOnline(this.props.model)) {
      name = "circle";
      color = "green";
    }
    return <Icon className="online" name={name} color={color} />;
  }


  /**
   * renders our popup content for our GUI to display to the user
   * @param trigger
   * @returns {*}
   */
  getPopupContent(trigger) {
    let member = this.props.model,
      username = member.username,
      name = member.fervieName,
      activeMoovie = member.currentActivity;

    let profileImage = (<FervieProfile
      showPopup={false}
      isBuddy={false}
      hasBuddyActions={false}
      circuitMember={this.props.model}
    />);

    let activeMoovieBlock = "";

    if (activeMoovie) {
      activeMoovieBlock = (
        <div className="activity">
          <Divider />
          <div>
            <b>
              <div className="activeMoovie">
                Moovie: {member.currentActivity}
              </div>
            </b>
          </div>
        </div>
      );
    }

    let popupContent = (
      <div>
        <div className="profileImage">{profileImage}</div>
        <div>
          <div>

          </div>
          <div className="fervieName">
            {name}
          </div>
          <div className="names">
            <div className="username">@{username}</div>
          </div>
        </div>
        {activeMoovieBlock}
      </div>
    );

    return (
      <Popup
        style={{ maxWidth: "300px" }}
        trigger={trigger}
        className="buddyPanel"
        content={popupContent}
        position="right center"
        inverted
        hideOnScroll
      />
    );
  }


  /**
   * gets our direct messaging icon which is only visible when hovering
   * @returns {*}
   */
  getMessagingIcon() {
    if (!this.props.isMe) {
      return <Icon className="message" name="comment" onClick={this.onClickMessageIcon}/>;
    } else {
      return "";
    }
  }

  onClickMessageIcon = () => {
    console.log("click message!")

    let dmPopoutController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.DM_POPOUT,
        this
      );

    dmPopoutController.openDMForMember(
      this.props.id
    );

  }

  /**
   * gets our class name for our buddy panel so we can render online or offline status
   * @returns {string}
   */
  getClassName() {
    let className;
    if (UtilRenderer.isMemberOnline(this.props.model)) {
      className = BaseClient.Strings.ONLINE;
    } else {
      className = BaseClient.Strings.OFFLINE;
    }
    return className;
  }

  getBuddyItem() {
    let profileImage = (<FervieProfile
      showPopup={false}
      isBuddy={false}
      hasBuddyActions={false}
      circuitMember={this.props.model}
    />);
    return (
      <List.Item
        className={this.getClassName()}
      >
        {this.getOnlineIcon()}
        {this.getMessagingIcon()}
        <List.Content>
          <List.Header>
            <div className="hiddenProfile">{profileImage}</div>
            {this.getDisplayName()}
          </List.Header>
        </List.Content>
      </List.Item>
    );
  }


  /**
   * renders our list item JSX
   * @returns {*}
   */
  render() {
    return this.getPopupContent(
      this.getBuddyItem()
    );
  }
}
