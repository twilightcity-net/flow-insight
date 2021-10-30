import React, { Component } from "react";
import { Icon, List } from "semantic-ui-react";
import { BaseClient } from "../../../../../clients/BaseClient";
import UtilRenderer from "../../../../../UtilRenderer";

/**
 * our list items that are displayed in our circuit sidebar panel
 */
export default class RetroPartyListItem extends Component {
  /**
   * builds our list item for the team panel with props
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[RetroPartyListItem]";
    this.isOnline = UtilRenderer.isMemberOnline(
      props.model
    );
  }

  /**
   * event handler for when we click on one of these items
   */
  handleClick = () => {
    this.props.onClickRow(this.props.model);
  };

  /**
   * gets our display name for our circuit panel list item
   * @returns {*}
   */
  getDisplayName() {
    return (
      <span>
        {this.props.model.fullName}
        {this.props.isMe && <i>{BaseClient.Strings.YOU}</i>}
      </span>
    );
  }

  /**
   * gets our icon for our circuit panel list item
   * @returns {*}
   */
  getIcon() {
    let name = "circle outline",
      color = "grey";

    if (this.props.isMe || this.isOnline) {
      name = "circle";
      color = "green";
    }
    return <Icon name={name} color={color} />;
  }

  /**
   * gets our class name for our team panel so we can render online or offline status
   * @returns {string}
   */
  getClassName() {
    return this.isOnline
      ? BaseClient.Strings.ONLINE
      : BaseClient.Strings.OFFLINE;
  }

  /**
   * renders our list item JSX
   * @returns {*}
   */
  render() {
    return (
      <List.Item
        className={this.getClassName()}
        key={this.props.model.memberId}
        onClick={this.handleClick}
      >
        {this.getIcon()}
        <List.Content>
          <List.Header>{this.getDisplayName()}</List.Header>
        </List.Content>
      </List.Item>
    );
  }
}
