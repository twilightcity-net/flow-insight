import React, { Component } from "react";
import { Icon, List } from "semantic-ui-react";
import { BaseClient } from "../../../../clients/BaseClient";
import UtilRenderer from "../../../../UtilRenderer";

export default class TeamPanelListItem extends Component {
  constructor(props) {
    super(props);
    this.name = "[TeamMember]";
    this.isOnline = UtilRenderer.isMemberOnline(props.model);
  }

  handleClick = () => {
    this.props.onClickRow(this.props.model, this.props.isMe);
  };

  getDisplayName() {
    return (
      <span>
        {this.props.model.displayName}
        {this.props.isMe && <i>{BaseClient.Strings.YOU}</i>}
      </span>
    );
  }

  getIcon() {
    let name = "circle outline",
      color = "grey";

    if (this.isOnline) {
      name = "user circle";
      color = "green";
    }
    return <Icon name={name} color={color} />;
  }

  getClassName() {
    return this.isOnline
      ? BaseClient.Strings.ONLINE
      : BaseClient.Strings.OFFLINE;
  }

  render() {
    return (
      <List.Item
        className={this.getClassName()}
        key={this.props.model.id}
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
