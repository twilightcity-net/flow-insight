import React, {Component} from "react";
import {Feed, Segment} from "semantic-ui-react";
import ChatFeedEvent from "../shared/ChatFeedEvent";
import CircuitMemberHelper from "../shared/CircuitMemberHelper";

/**
 * this component displays the transparent popup window
 * that only contains recent messages on a transparent background
 * then fades away
 */
export default class ChatPeekPopup extends Component {

  static feedWindowId = "chatPeekWindow";

  /**
   * Initialize the child components of the layout
   * @param props - the properties of the component to render
   */
  constructor(props) {
    super(props);
    this.name = "[ChatPeekPopup]";
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
    let feedElement = document.getElementById(ChatPeekPopup.feedWindowId);
    if (feedElement) {
      feedElement.scrollTop = feedElement.scrollHeight;
    }
  };

  getFeedEvents() {
    return this.props.messages.map((message, i) => {
      const member = CircuitMemberHelper.getMemberForUsername(this.props.circuitMembers, message.username);
      const isBuddy = member && this.props.buddiesById.get(member.memberId);
      const isLast = i === this.props.messages.length - 1;
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
          hasPopup={false}
          isLast={isLast}
          texts={message.texts}
          memberByIdMap={this.props.memberByIdMap}
          onAddReaction={this.onAddReaction}
          onRemoveReaction={this.onRemoveReaction}
          onAddBuddy={this.onAddBuddy}
        />
        );
      });
  }

  getBlankFeedEvents() {
    return <div><br/><br/><br/><br/><br/><br/><br/><br/><br/></div>
  }

  onClickWindow =() => {
    this.props.onActivateFullChatWindow();
  }
  /**
   * renders the root console layout of the chat console view
   * @returns {*} - the JSX to render
   */
  render() {
    const height = "95%";
    return (
      <Segment inverted onClick={this.onClickWindow}
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
          {this.getBlankFeedEvents()}
          {this.getFeedEvents()}
        </Feed>
      </Segment>
    );
  }
}
