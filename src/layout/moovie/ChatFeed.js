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
    this.scrollToFeedBottom();
  }

  /**
   * function used to scroll our feed panel to the bottom when we build the
   * list or get a new talk message event in from the talk client
   */
  scrollToFeedBottom = () => {
    let feedElement = document.getElementById(ChatFeed.feedWindowId);
    feedElement.scrollTop = feedElement.scrollHeight;
  };

  getNoMessage() {
    return (<div className="noMessages">No messages yet.</div>);
  }

  getFeedEvents() {
    return this.props.messages.map((message, i) => {
      const member = CircuitMemberHelper.getMemberForUsername(this.props.circuitMembers, message.username);

      return (<ChatFeedEvent
          key={i}
          circuitMember={member}
          name={message.username}
          time={message.time}
          isMe={message.isMe}
          isPuppet={message.isPuppet}
          texts={message.texts}
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
