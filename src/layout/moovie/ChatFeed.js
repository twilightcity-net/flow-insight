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
    console.log("scroll to bottom!");
    let feedElement = document.getElementById(ChatFeed.feedWindowId);
    feedElement.scrollTop = feedElement.scrollHeight;
  };

  getNoMessage() {
    return (<div className="noMessages">No messages yet.</div>);
  }

  getFeedEvents() {
    let fervieColor = null;
    let fervieAccessory = null;
    let fervieTertiaryColor = null;

    return this.props.messages.map((message, i) => {
      const member = CircuitMemberHelper.getMemberForUsername(this.props.circuitMembers, message.username);

      if (member) {
        fervieColor = member.fervieColor;
        fervieAccessory = member.fervieAccessory;
        fervieTertiaryColor = member.fervieTertiaryColor;
      } else {
        fervieColor = null;
        fervieAccessory = null;
        fervieTertiaryColor = null;
      }

      return (<ChatFeedEvent
          key={i}
          fervieColor={fervieColor}
          fervieAccessory={fervieAccessory}
          fervieTertiaryColor={fervieTertiaryColor}
          name={message.username}
          time={message.time}
          isMe={message.isMe}
          texts={message.texts}
        />
        );
      });
  }

  /**
   * renders our feed messages
   * @returns {*}
   */
  getFeedEvent(key, isMe) {
        return (<ChatFeedEvent
            key={key}
            fervieColor={null}
            fervieAccessory={"SUNGLASSES"}
            fervieTertiaryColor={"#000000"}
            name={"name"}
            time={"Yesterday, 1:40PM"}
            isMe={isMe}
            texts={["Hello this is text.  Not sure what " +
            "this is going to say, but I " +
            "want it to wrap around a little bit " +
            "so I can see the wordwrap."]}
          />
        );

  }

  /**
   * renders our feed messages
   * @returns {*}
   */
  getShortFeedEvent(key, isMe) {
    return (<ChatFeedEvent
        key={key}
        fervieColor={null}
        fervieAccessory={"SUNGLASSES"}
        fervieTertiaryColor={"#000000"}
        name={"name"}
        time={"Yesterday, 1:40PM"}
        isMe={isMe}
        texts={["Yo"]}
      />
    );

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
          {/*{this.getFeedEvent(101, false)}*/}
          {/*{this.getFeedEvent(102, false)}*/}
          {/*{this.getFeedEvent(103, true)}*/}
          {/*{this.getShortFeedEvent(104, false)}*/}
          {/*{this.getShortFeedEvent(105, true)}*/}
          {hasMessages? this.getFeedEvents(): this.getNoMessage()}
        </Feed>
      </Segment>
    );
  }
}
