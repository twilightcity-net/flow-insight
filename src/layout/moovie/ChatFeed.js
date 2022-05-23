import React, {Component} from "react";
import {Feed, Segment, TextArea} from "semantic-ui-react";
import FlowFeedEvent from "../console/content/flow/components/FlowFeedEvent";
import ChatFeedEvent from "./ChatFeedEvent";

/**
 * this component is the feed of messages for the always-on-top chat overlay panel
 */
export default class ChatFeed extends Component {
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
   * renders our feed messages
   * @returns {*}
   */
  getFeedEvent(key) {
        return (<ChatFeedEvent
            key={key}
            fervieColor={null}
            fervieAccessory={"SUNGLASSES"}
            fervieTertiaryColor={"#000000"}
            name={"name"}
            time={"time"}
            texts={["Hello this is text", "this is another text"]}
          />
        );


    // return this.state.feedEvents.map((message, i) => {
    //   if (i === this.state.feedEvents.length - 1) {
    //     return (
    //       <FlowFeedEvent
    //         key={i}
    //         circuitMember={this.getCircuitMemberForUsername(
    //           message.name
    //         )}
    //         name={message.name}
    //         time={message.time}
    //         texts={message.text}
    //         setLastFeedEvent={
    //           this.setLastFeedEventComponent
    //         }
    //       />
    //     );
    //   } else {
    //     return (
    //       <FlowFeedEvent
    //         key={i}
    //         circuitMember={this.getCircuitMemberForUsername(
    //           message.name
    //         )}
    //         name={message.name}
    //         time={message.time}
    //         texts={message.text}
    //       />
    //     );
    //   }
    // });
  }

  /**
   * renders the root console layout of the chat console view
   * @returns {*} - the JSX to render
   */
  render() {
    let height = "95%";
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
          {this.getFeedEvent(1)}
          {this.getFeedEvent(2)}
          {this.getFeedEvent(3)}
        </Feed>
      </Segment>
    );
  }
}
