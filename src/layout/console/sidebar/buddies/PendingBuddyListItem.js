import React, {Component} from "react";
import {Icon, List,} from "semantic-ui-react";
import {BaseClient} from "../../../../clients/BaseClient";

/**
 * our list items that are displayed in our buddy panel.
 */
export default class PendingBuddyListItem extends Component {

  constructor(props) {
    super(props);
    this.name = "[PendingBuddyListItem]";
    this.state = {
    };
  }

  /**
   * gets our display name for our team panel list item
   * @returns {*}
   */
  getDisplayName() {
    let displayName = "";
    if (this.props.model.email) {
      displayName = this.props.model.email;
    } else if (this.props.model.toFervieName) {
      displayName = this.props.model.toFervieName;
    } else {
      displayName = this.props.model.toUsername;
    }
    return (
      <span>
        Invite: {displayName}
      </span>
    );
  }


  /**
   * gets our icon for our buddy panel list item
   * @returns {*}
   */
  getIcon() {
    let name = "circle outline",
      color = "grey";

    return <Icon name={name} color={color} />;
  }

  /**
   * gets our class name for our buddy panel so we can render online or offline status
   * @returns {string}
   */
  getClassName() {
    return  BaseClient.Strings.OFFLINE;
  }


  /**
   * renders our list item JSX
   * @returns {*}
   */
  render() {
    return (
      <List.Item
      className={this.getClassName()}
      key={this.props.model.buddyRequestId}
    >
      {this.getIcon()}
      <List.Content>
        <List.Header>
          {this.getDisplayName()}
        </List.Header>
      </List.Content>
    </List.Item>
    );
  }
}
