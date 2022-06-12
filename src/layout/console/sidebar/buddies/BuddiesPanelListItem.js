import React, {Component} from "react";
import {Icon, List,} from "semantic-ui-react";
import {BaseClient} from "../../../../clients/BaseClient";
import UtilRenderer from "../../../../UtilRenderer";
import {RendererControllerFactory} from "../../../../controllers/RendererControllerFactory";

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
   * event handler for when we click on one of these items
   */
  handleClick = () => {
    this.props.onClickRow(this.props.model);
  };

  /**
   * gets our display name for our team panel list item
   * @returns {*}
   */
  getDisplayName() {
    return (
      <span>
        {this.props.model.fervieName}
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


  /**
   * renders our list item JSX
   * @returns {*}
   */
  render() {
    return (
      <List.Item
      className={this.getClassName()}
      onClick={this.handleClick}
    >
      {this.getOnlineIcon()}
      {this.getMessagingIcon()}
      <List.Content>
        <List.Header>
          {this.getDisplayName()}
        </List.Header>
      </List.Content>
    </List.Item>
    );
  }
}