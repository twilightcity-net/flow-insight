import React, {Component} from "react";
import {Feed, Segment} from "semantic-ui-react";
import ChatFeedEvent from "./ChatFeedEvent";
import CircuitMemberHelper from "./CircuitMemberHelper";

/**
 * this component is the feed of messages for the always-on-top chat overlay panel
 */
export default class ChatFeed extends Component {

  static feedWindowId = "chatFeedWindow";

  /**
   * Initialize the child components of the layout
   * @param props - the properties of the component to render
   */
  constructor(props) {
    super(props);
    this.name = "[ChatFeed]";
  }


  /**
   * Called when the chat console is first loaded
   */
  componentDidMount = () => {
  };

  /**
   * called right before when the component will unmount
   */
  componentWillUnmount = () => {
  };

  /**
   * Scroll to the bottom of the feed whenever there's an update
   */
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.hasMessageChange(prevProps.messages, this.props.messages)) {
      this.scrollToFeedBottom();
    }
  }

  /**
   * Detect whether there's a new message added
   * @param oldMessages
   * @param newMessages
   */
  hasMessageChange(oldMessages, newMessages) {
    if (oldMessages.length !== newMessages.length) {
      return true;
    }

    if (oldMessages.length > 0) {
      const lastOldMessage = oldMessages[oldMessages.length - 1];
      const lastNewMessage = newMessages[newMessages.length - 1];

      if (lastOldMessage.texts.length !== lastNewMessage.texts.length) {
        return true;
      }
    }
    return false;
  }

  /**
   * function used to scroll our feed panel to the bottom when we build the
   * list or get a new talk message event in from the talk client
   */
  scrollToFeedBottom = () => {
    let feedElement = document.getElementById(ChatFeed.feedWindowId);
    feedElement.scrollTop = feedElement.scrollHeight;
  };

  onAddReaction = (messageId, emoji, isLocalOnly) => {
    this.props.onAddReaction(messageId, emoji, isLocalOnly);
  }

  onRemoveReaction = (messageId, emoji, isLocalOnly) => {
    this.props.onRemoveReaction(messageId, emoji, isLocalOnly);
  }

  onAddBuddy = (circuitMember) => {
    this.props.onAddBuddy(circuitMember);
  }

  getNoMessage() {
    return (<div className="noMessages">No messages yet.</div>);
  }

  getFeedEvents() {
    return this.props.messages.map((message, i) => {
      const member = CircuitMemberHelper.getMemberForUsername(this.props.circuitMembers, message.username);
      const isBuddy = member && this.props.buddiesById.get(member.memberId);
      return (<ChatFeedEvent
          key={i}
          circuitMember={member}
          id={message.id}
          name={message.username}
          time={message.time}
          isMe={message.isMe}
          isBuddy={isBuddy}
          isPuppet={message.isPuppet}
          isLocalOnly={message.isLocalOnly}
          texts={message.texts}
          memberByIdMap={this.props.memberByIdMap}
          onAddReaction={this.onAddReaction}
          onRemoveReaction={this.onRemoveReaction}
          onAddBuddy={this.onAddBuddy}
        />
        );
      });
  }


  /**
   * renders the root console layout of the chat console view
   * @returns {*} - the JSX to render
   */
  render() {
    const height = "95%";
    const hasMessages = this.props.messages.length > 0;
    return (
      <Segment inverted
        style={{
          height: height,
          padding: "0px",
        }}
      >
        <Feed className="chat-feed"
              style={{
                height: height,
              }}
        >
          {hasMessages? this.getFeedEvents(): this.getNoMessage()}
        </Feed>
      </Segment>
    );
  }
}
