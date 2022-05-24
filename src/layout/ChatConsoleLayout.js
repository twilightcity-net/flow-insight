import React, {Component} from "react";
import {Image} from "semantic-ui-react";
import ChatInput from "./moovie/ChatInput";
import {MoovieClient} from "../clients/MoovieClient";
import {TalkToClient} from "../clients/TalkToClient";
import {RendererEventFactory} from "../events/RendererEventFactory";
import {BaseClient} from "../clients/BaseClient";
import ChatFeed from "./moovie/ChatFeed";
import UtilRenderer from "../UtilRenderer";
import {MemberClient} from "../clients/MemberClient";
import CircuitMemberHelper from "./moovie/CircuitMemberHelper";
import MontyButton from "./moovie/MontyButton";
import MoovieBanner from "./moovie/MoovieBanner";

/**
 * this component is the layout for the always-on-top chat overlay panel
 */
export default class ChatConsoleLayout extends Component {

  static roomMemberPropStr = "roomMember";

  /**
   * Initialize the component
   * @param props - the properties of the component to render
   */
  constructor(props) {
    super(props);
    this.name = "[MoovieLayout]";
    this.state = {
      messages : [],
      circuitMembers : []
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
      this.memberHelper = new CircuitMemberHelper(this.props.moovieId);
      this.loadMoovieAndConnectRoom(this.props.moovieId);
    }
  };

  /**
   * called right before when the component will unmount
   */
  componentWillUnmount = () => {
    if (this.state.moovie) {
      TalkToClient.leaveExistingRoom(this.state.moovie.talkRoomId, this, (arg) => {
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
      if (arg.uri === this.state.moovie.talkRoomId) {
        console.log("message is for this room!!");
        this.addMessageToFeed(arg);
      } else {
        console.log("not for me");
      }
    } else if (arg.messageType === BaseClient.MessageTypes.ROOM_MEMBER_STATUS_EVENT) {
      this.handleRoomMemberStatusEvent(arg);
    }
  };


  /**
   * When a member joins the room, we need to fetch their fervie member profile info,
   * So we can display the proper fervie color and accessories in the icon
   * @param arg
   */
  handleRoomMemberStatusEvent(arg) {
    let data = arg.data,
      roomMember = data[ChatConsoleLayout.roomMemberPropStr];

    let metaProps = arg.metaProps,
      username = UtilRenderer.getUsernameFromMetaProps(metaProps);

    if (data.statusEvent === BaseClient.RoomMemberStatus.ROOM_MEMBER_JOIN) {
      this.memberHelper.addMemberIfMissing(username, roomMember);
      this.setState({
        members : this.memberHelper.getAllMembers()}
      );
    }
  }

  /**
   * Add the chat message to the message feed for display
   */
  addMessageToFeed(talkMessage) {
    const metaProps = talkMessage.metaProps;
    const username = UtilRenderer.getUsernameFromMetaProps(metaProps);
    const time = UtilRenderer.getChatMessageTimeString(talkMessage.messageTime);
    const isMe = (username === MemberClient.me.username);

    this.setState((prevState) => {
      const newMessage = {
        username: username,
        time: time,
        texts: [talkMessage.data.message],
        isMe: isMe,
        fervieColor: null,
        fervieAccessory: "SUNGLASSES",
        tertiaryColor: null
      };
      return this.updateMessages(prevState.messages, newMessage);

    });
  }



  /**
   * If two messages at the same time, condense the data to display
   * bubbles adjacent without the timestamp underneath.
   */
  updateMessages(messages, newMessage) {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.time === newMessage.time && lastMessage.username === newMessage.username) {
        lastMessage.texts.push(newMessage.texts[0]);
      } else {
        messages.push(newMessage);
      }
    } else {
      messages.push(newMessage);
    }

    return {
      messages: messages
    }
  }

  /**
   * Load the moovie circuit, circuit members, and connect to the chat room
   * @param moovieId
   */
  loadMoovieAndConnectRoom(moovieId) {
    MoovieClient.getMoovieCircuit(moovieId, this, (arg) => {
      if (!arg.error) {
        const moovie = arg.data;
        this.setState({
          moovie: moovie
        });

        TalkToClient.joinExistingRoom(moovie.talkRoomId, this, (arg) => {
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
    this.memberHelper.loadMembers((members) => {
      console.log("members loaded");
      this.setState({
        circuitMembers: members
      })
    });
  }

  /**
   * When we click on the Monty icon
   */
  onClickMonty = () => {
    this.props.onClickMonty();
  }

  /**
   * When we exit with the monty icon
   */
  onMontyExit = () => {
    this.props.onMontyExit();
  }

  onStartMoovie = () => {
    console.log("onStartMoovie");
    if (!this.state.moovie) return;

    MoovieClient.startMoovie(this.state.moovie.id, this, (arg) => {
      this.handleMoovieResponse(arg);
    });
  }

  onPauseMoovie = () => {
    console.log("onPauseMoovie");
    if (!this.state.moovie) return;

    MoovieClient.pauseMoovie(this.state.moovie.id, this, (arg) => {
      this.handleMoovieResponse(arg);
    });
  }

  onResumeMoovie = () => {
    console.log("onResumeMoovie");
    if (!this.state.moovie) return;

    MoovieClient.resumeMoovie(this.state.moovie.id, this, (arg) => {
      this.handleMoovieResponse(arg);
    });
  }

  onRestartMoovie = () => {
    console.log("onRestartMoovie");
    if (!this.state.moovie) return;

    MoovieClient.restartMoovie(this.state.moovie.id, this, (arg) => {
      this.handleMoovieResponse(arg);
    });
  }

  handleMoovieResponse(arg) {
    if (!arg.error) {
      this.setState({
        moovie: arg.data
      });
    } else {
      console.error("Error: "+arg.error);
    }
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
    if (!this.state.moovie) {
      console.error("No moovie defined!  Unable to post chat");
      callback();
    } else {
      TalkToClient.publishChatToRoom(this.state.moovie.talkRoomId, text, this,
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
        <MoovieBanner moovie={this.state.moovie}/>
        <div id="chatFeedWindow" className="chatFeed" >
          {<ChatFeed circuitMembers={this.state.circuitMembers} messages={this.state.messages}/>}
        </div>
        <div>
          <MontyButton moovie={this.state.moovie}
                       isConsoleOpen={this.props.isConsoleOpen}
                       onClickMonty={this.onClickMonty}
                       onStartMoovie={this.onStartMoovie}
                       onPauseMoovie={this.onPauseMoovie}
                       onResumeMoovie={this.onResumeMoovie}
                       onRestartMoovie={this.onRestartMoovie}
                       onMontyExit={this.onMontyExit}/>
          <ChatInput onEnterKey={this.onEnterKey}/>
        </div>
      </div>
    );
  }



}
