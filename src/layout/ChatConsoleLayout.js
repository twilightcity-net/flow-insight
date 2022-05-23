import React, {Component} from "react";
import {Image} from "semantic-ui-react";
import ChatInput from "./moovie/ChatInput";
import {MoovieClient} from "../clients/MoovieClient";
import {TalkToClient} from "../clients/TalkToClient";
import {RendererEventFactory} from "../events/RendererEventFactory";
import {BaseClient} from "../clients/BaseClient";
import ChatFeed from "./moovie/ChatFeed";

/**
 * this component is the layout for the always-on-top chat overlay panel
 */
export default class ChatConsoleLayout extends Component {

  /**
   * Initialize the component
   * @param props - the properties of the component to render
   */
  constructor(props) {
    super(props);
    this.name = "[MoovieLayout]";
    this.state = {
    };

    this.talkRoomMessageListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.TALK_MESSAGE_ROOM,
        this,
        this.onTalkRoomMessage
      );
  }

  /**
   * Called when the chat console is first loaded
   */
  componentDidMount = () => {
    if (this.props.moovieId) {
      this.loadMoovieAndConnectRoom(this.props.moovieId);
    }
  };

  /**
   * called right before when the component will unmount
   */
  componentWillUnmount = () => {
    if (this.moovie) {
      TalkToClient.leaveExistingRoom(this.moovie.talkRoomId, this, (arg) => {
        if (!arg.error) {
          console.log("room left");
        } else {
          console.error("Unable to leave room: "+arg.error);
        }
      });
    }
  };

  onTalkRoomMessage = (event, arg) => {
    if (arg.messageType === BaseClient.MessageTypes.CHAT_MESSAGE_DETAILS) {
      if (arg.uri === this.moovie.talkRoomId) {
        console.log("message is for this room!!");
        console.log(arg.data.message);
      } else {
        console.log("not for me");
      }
    }
  };

  /**
   * Load the moovie circuit and connect to the chat room
   * @param moovieId
   */
  loadMoovieAndConnectRoom(moovieId) {
    MoovieClient.getMoovieCircuit(moovieId, this, (arg) => {
      if (!arg.error) {
        this.moovie = arg.data;
        TalkToClient.joinExistingRoom(this.moovie.talkRoomId, this, (arg) => {
          if (!arg.error) {
            console.log("room joined");
          } else {
            console.error("Unable to join room: "+arg.error);
          }
        });
      } else {
        console.error("Unable to load moovie circuit: "+arg.error);
      }
    });
  }

  /**
   * When we mouse over the Monty icon
   */
  mouseOverIcon = () => {
    this.props.onMouseOverIcon();
  }

  /**
   * When we hit the enter key in the chat
   * @param text
   * @param callback
   */
  onEnterKey = (text, callback) => {
    console.log("On enter key! = "+text);
    this.addChatMessage(text, callback);
  }

  /**
   * adds a new message to our messages array and triggers a rerender
   * @param text
   * @param callback
   */
  addChatMessage = (text, callback) => {
    if (!this.moovie) {
      console.error("No moovie defined!  Unable to post chat");
      callback();
    } else {
      TalkToClient.publishChatToRoom(this.moovie.talkRoomId, text, this,
        (arg) => {
          if (!arg.error) {
            console.log("chat published");
          } else {
            console.error("Unable to publish chat: "+arg.error);
          }
          if (callback) {
            callback();
          }
        }
      );
    }
  };


  /**
   * renders the chat console layout
   * @returns {*} - the JSX to render
   */
  render() {
    return (
      <div id="component" className="moovieChat">
        <div id="chatFeedWindow" className="chatFeed" >
          <ChatFeed />
        </div>
        <div>
          <Image id="montyIcon" src={"./assets/animation/monty/monty_icon.png"} className="monty" onMouseOver={this.mouseOverIcon}/>
          <ChatInput onEnterKey={this.onEnterKey}/>
        </div>
      </div>
    );
  }


}
