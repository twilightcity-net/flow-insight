import React, { Component } from "react";
import {
  Divider,
  Icon,
  Label,
  List,
  Popup,
} from "semantic-ui-react";
import { BaseClient } from "../../../../clients/BaseClient";
import UtilRenderer from "../../../../UtilRenderer";
import {RendererControllerFactory} from "../../../../controllers/RendererControllerFactory";

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
      isAlarm: UtilRenderer.isMemberAlarm(props.model),
      isHelping: UtilRenderer.isMemberHelping(props.model),
    };
    this.lastMessageClickTime = null;
  }

  /**
   * When no task is available
   * @type {string}
   */
  static NO_TASK = "No Task";

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
        isAlarm: UtilRenderer.isMemberAlarm(model),
        isHelping: UtilRenderer.isMemberHelping(model),
      });
    }

    return true;
  }

  /**
   * event handler for when we click on one of these items
   */
  handleClick = () => {
    console.log("handleClick!");
    setTimeout(() => {
      const clickTime = window.performance.now();
      console.log("elapsed = "+(clickTime - this.lastMessageClickTime));
      if (!this.lastMessageClickTime || clickTime - this.lastMessageClickTime >= 200) {
        this.props.onClickRow(this.props.model);
      }
    }, 33);
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
   * renders our popup content for our GUI to display to the user
   * @param trigger
   * @returns {*}
   */
  getPopupContent(trigger) {
    let member = this.props.model,
      username = member.username,
      name = member.fullName,
      xpSummary = member.xpSummary,
      level = xpSummary.level,
      activeTaskName = member.activeTaskName,
      activeTaskSummary = member.activeTaskSummary,
      workingOn = member.workingOn,
      activeCircuit = member.activeCircuit;

    let optionalLinkIcon = "";
    if (this.props.model.pairingNetwork) {
      optionalLinkIcon = (
        <Icon
          name="linkify"
          size="tiny"
          className="teamLink"
        />
      );
    }

    let popupContent = (
      <div>
        <div>
          <div className="username">
            @{username}
            {optionalLinkIcon}
          </div>
          <Label
            className="level"
            color="violet"
            horizontal
          >
            {xpSummary.title}
            <Label.Detail>{level}</Label.Detail>
          </Label>
          <div className="names">
            <div className="name">{name}</div>
          </div>
        </div>
        {!activeCircuit &&
          this.getTaskPopupContent(
            activeTaskName,
            activeTaskSummary,
            workingOn
          )}
        {!!activeCircuit &&
          this.getAlarmPopupContent(activeCircuit)}
      </div>
    );

    return (
      <Popup
        style={{ maxWidth: "300px" }}
        trigger={trigger}
        className="teamPanel chunkTitle"
        content={popupContent}
        position="right center"
        inverted
        hideOnScroll
      />
    );
  }

  /**
   * renders our task popup content for our team panel tooltip
   * @param activeTaskName
   * @param activeTaskSummary
   * @param workingOn
   * @returns {*}
   */
  getTaskPopupContent(
    activeTaskName,
    activeTaskSummary,
    workingOn
  ) {
    if (!activeTaskName || activeTaskName === TeamPanelListItem.NO_TASK) {
      return "";
    } else {
      return (
        activeTaskName && (
          <div className="task">
            <Divider />
            <div>
              <b>
                <div className="taskhighlight">
                  {activeTaskName}
                </div>
              </b>
            </div>
            <div className="workingOn">{workingOn}</div>
          </div>
        )
      );
    }
  }

  /**
   * renders our alarm circuit content for our tool tip of our team panel
   * @param circuit
   * @returns {*}
   */
  getAlarmPopupContent(circuit) {
    let description = " /wtf/" + circuit.circuitName;
    if (circuit.description) {
      description = circuit.description;
    }

    return (
      <div className="circuit">
        <Divider />
        <div className="state">TROUBLESHOOT:</div>
        <div className="name">{description}</div>
        <div className="owner">
          <i>{"Owner: (" + circuit.ownerName + ")"}</i>
        </div>
        <div className="time">
          <Icon name="lightning" />
          {UtilRenderer.getWtfTimerFromCircuit(circuit)}
        </div>
      </div>
    );
  }

  /**
   * gets our icon for our team panel list item
   * @returns {*}
   */
  getOnlineIcon() {
    let name = "circle outline",
      color = "grey";

    if (this.state.isOnline && !this.state.isAlarm) {
      name = "circle";
      color = "green";
    } else if (
      this.state.isOnline &&
      this.state.isHelping
    ) {
      name = "circle";
      color = "violet";
    } else if (this.state.isOnline && this.state.isAlarm) {
      name = "circle";
      color = "red";
    }
    return <Icon className="online" name={name} color={color} />;
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

  pairingIncludesMe() {
    if (
      this.props.model &&
      this.props.model.pairingNetwork
    ) {
      let links =
        this.props.model.pairingNetwork.sparkLinks;
      for (let i = 0; i < links.length; i++) {
        let username = links[i].name;

        if (username === this.props.meUsername) {
          return true;
        }
      }
    }
    return false;
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
    console.log("click message!");
    this.lastMessageClickTime = window.performance.now();
    let dmPopoutController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.DM_POPOUT,
        this
      );

    dmPopoutController.openDMForMember(
      this.props.model.id
    );
  }

  getTeamMemberListItem() {
    let optionalLinkIcon = "";
    if (
      this.props.model.pairingNetwork &&
      this.pairingIncludesMe()
    ) {
      optionalLinkIcon = (
        <Icon
          name="linkify"
          size="tiny"
          className="teamLink"
        />
      );
    }

    return (
      <List.Item
        className={this.getClassName()}
        key={this.props.model.id}
        onClick={this.handleClick}
      >
        {this.getOnlineIcon()}
        {this.getMessagingIcon()}
        <List.Content>
          <List.Header>
            {this.getDisplayName()}
            {optionalLinkIcon}
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
      this.getTeamMemberListItem()
    );
  }
}
