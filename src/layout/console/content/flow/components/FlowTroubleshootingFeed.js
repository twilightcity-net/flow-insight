import React, {Component} from "react";
import {Divider, Feed, Grid, Segment} from "semantic-ui-react";
import UtilRenderer from "../../../../../UtilRenderer";
import FlowFeedEvent from "./FlowFeedEvent";
import FeedCreator from "../../support/FeedCreator";

/**
 * this is the gui component that displays the wtf troubleshooting session feed
 * highlighted in the chart
 */
export default class FlowTroubleshootingFeed extends Component {

  /**
   * this is our active circuit feed's elemental id. This is so we can look
   * up the active circuit feed by getElementById in our DOM.
   * @type {string}
   */
  static activeCircuitFeedElIdString =
    "past-troubleshoot-feed";

  /**
   * the dom el id name of the circuit feed content panel
   * @type {string}
   */
  static circuitContentFeedPanelID = "pastContentFeedPanel";


  /**
   * builds the troubleshooting session feed below the chart
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[FlowTroubleshootingFeed]";
    this.state = {
      feedEvents: [],
      members: []
    }
  }

  /**
   * our click handler for clicking intentions
   */
  handleClick = () => {
    console.log("handle click!");
  };

  /**
   * Initialize the feed for the first time on mount
   */
  componentDidMount() {
    this.feedCreator = new FeedCreator(this.props.circuit, this.props.circuitMembers, this.props.me);

    this.feedCreator.createTroubleshootFeed(this.props.troubleshootMessages, (feedData) => {
      console.log("initializing feed events! "+feedData.feedEvents.length);
      this.setState({
        feedEvents: feedData.feedEvents,
        members: feedData.members
      });
    });
  }

  /**
   * If we're looking at a different circuit now, update the state
   * @param prevProps
   * @param prevState
   * @param snapshot
   */
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.circuit && this.props.circuit && prevProps.circuit.circuitName !== this.props.circuit.circuitName) {
      this.feedCreator = new FeedCreator(this.props.circuit, this.props.circuitMembers, this.props.me);

      this.feedCreator.createTroubleshootFeed(this.props.troubleshootMessages, (feedData) => {
        console.log("updating feed events! "+feedData.feedEvents.length);
        this.setState({
          feedEvents: feedData.feedEvents,
          members: feedData.members
        });
      });
    }
  }


  /**
   * renders our active feed component into the current resource view
   * @returns {*}
   */
  getActiveCircuitFeedContent(isChatActive) {
    let circuit = this.props.circuit,
      openTimeStr = "NOW",
      height = "95%";

    if (circuit) {
      openTimeStr = UtilRenderer.getOpenTimeString(
        circuit.openTime
      );
    }

    return (
      <Segment
        inverted
        id={FlowTroubleshootingFeed.circuitContentFeedPanelID}
        style={{
          height: height,
          padding: "0px",
        }}
      >
        <Feed
          className="chat-feed"
          id={
            FlowTroubleshootingFeed.activeCircuitFeedElIdString
          }
          style={{
            height: height,
          }}
        >
          <div style={{height:"10px"}}/>
          {this.getFeedEventsFromMessagesArrayContent()}
          <br />
        </Feed>
      </Segment>
    );
  }

  /**
   * renders our divider content which goes between messages. for keyframe markers
   * @param timeStr
   * @returns {*}
   */
  getDividerContent(timeStr) {
    return (
      <Divider inverted horizontal content={timeStr} />
    );
  }


  /**
   * Get the circuit member that matches the username
   * @param username
   * @returns {*}
   */
  getCircuitMemberForUsername(username) {
    for (
      let i = 0;
      i < this.state.members.length;
      i++
    ) {
      if (
        this.state.members[i].username === username
      ) {
        return this.state.members[i];
      }
    }

    return null;
  }

  /**
   * callback function which is used by the active circuit feed event to
   * update the last feed event. This is suppose to concat messages which
   * have the same username.
   * @param component
   */
  setLastFeedEventComponent = (component) => {
    this.lastFeedEvent = component;
  };

  /**
   * renders our feed messages from our messages array.
   * @returns {*}
   */
  getFeedEventsFromMessagesArrayContent() {
    return this.state.feedEvents.map((message, i) => {
      if (i === this.state.feedEvents.length - 1) {
        return (
          <FlowFeedEvent
            key={i}
            circuitMember={this.getCircuitMemberForUsername(
              message.name
            )}
            name={message.name}
            time={message.time}
            texts={message.text}
            setLastFeedEvent={
              this.setLastFeedEventComponent
            }
          />
        );
      } else {
        return (
          <FlowFeedEvent
            key={i}
            circuitMember={this.getCircuitMemberForUsername(
              message.name
            )}
            name={message.name}
            time={message.time}
            texts={message.text}
          />
        );
      }
    });
  }

  /**
   * renders the list of intentions belonging to the task
   * @returns {*}
   */
  render() {

    return (
      <div>
        <div id="component" className="flowTroubleFeed">
          <Grid id="intentions-row-grid" inverted columns={16}>
            <Grid.Row className="sessionHeaderRow">
              <Grid.Column width={16}>
                <div className="troubleHeader">Troubleshooting: {UtilRenderer.getFormattedCircuitName(this.props.circuit.circuitName)}</div>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <div className="scrolling">
            {this.getActiveCircuitFeedContent(false)}
          </div>
        </div>
      </div>
    );
  }
}
