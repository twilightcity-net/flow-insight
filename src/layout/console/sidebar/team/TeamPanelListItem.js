import React, { Component } from "react";
import { Icon, List } from "semantic-ui-react";
import { BaseClient } from "../../../../clients/BaseClient";
import UtilRenderer from "../../../../UtilRenderer";

/**
 * our list items that are displayed in our team panel. contains
 * multiple teams per panel.
 */
export default class TeamPanelListItem extends Component {
  /**
   * builds our list item for the team panel with props. This class os
   * a bit more complex where we need to us the property to store  the
   * model changes which  then can trigger state changes making this
   * a 2 dimensional type component with multiple things triggering update
   * flags.
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[TeamPanelListItem]";
    this.state = {
      isOnline: UtilRenderer.isMemberOnline(props.model),
      isAlarm: UtilRenderer.isMemberAlarm(props.model)
    };
  }

  /**
   * this function gets called when we received a property or a state update. We need
   * to make we first check for the model that is stored in the prop. If this model
   * changes then we also need to update the isOnline status that is stored in the
   * components state for each of the team members of the team panel.
   * @param nextProps
   * @param nextState
   * @param nextContext
   * @returns {boolean}
   */
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    let model = nextProps.model;
    if (this.props.model !== model) {
      this.setState({
        isOnline: UtilRenderer.isMemberOnline(model),
        isAlarm: UtilRenderer.isMemberAlarm(model)
      });
      return false;
    }

    return !(
      this.state.isOnline === nextState.isOnline &&
      this.state.isAlarm === nextState.isAlarm
    );
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
        {this.props.model.displayName}
        {this.props.isMe && <i>{BaseClient.Strings.YOU}</i>}
      </span>
    );
  }

  /**
   * gets our icon for our team panel list item
   * @returns {*}
   */
  getIcon() {
    let name = "circle outline",
      color = "grey";

    if (this.state.isOnline && !this.state.isAlarm) {
      name = "circle";
      color = "green";
    } else if (this.state.isOnline && this.state.isAlarm) {
      name = "circle";
      color = "red";
    }
    return <Icon name={name} color={color} />;
  }

  /**
   * gets our class name for our team panel so we can render online or offline status
   * @returns {string}
   */
  getClassName() {
    let className;
    if (this.state.isOnline) {
      className = BaseClient.Strings.ONLINE;
    } else {
      className = BaseClient.Strings.OFFLINE;
    }
    if (this.state.isAlarm) {
      className += " " + BaseClient.Strings.ALARM;
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
