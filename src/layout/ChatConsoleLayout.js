import React, {Component} from "react";
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
import MontyPuppet from "./moovie/MontyPuppet";

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

    this.hasMontyDoneIntro = false;

    this.talkRoomMessageListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.TALK_MESSAGE_ROOM,
        this,
        this.onTalkRoomMessage
      );

    this.puppet = new MontyPuppet();
  }

  /**
   * Called when the chat console is first loaded
   */
  componentDidMount = () => {

    this.hasMontyDoneIntro = false;

    if (this.props.moovieId) {
      this.memberHelper = new CircuitMemberHelper(this.props.moovieId);
      this.loadMoovieAndConnectRoom(this.props.moovieId);
    }
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!prevProps.isConsoleOpen && this.props.isConsoleOpen && !this.hasMontyDoneIntro) {
      this.hasMontyDoneIntro = true;
      this.addMontyIntroMessage(this.state.moovie);
    }
  }

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
    if (arg.uri === this.state.moovie.talkRoomId) {
      if (arg.messageType === BaseClient.MessageTypes.CHAT_MESSAGE_DETAILS
        || arg.messageType === BaseClient.MessageTypes.PUPPET_MESSAGE) {
        this.addMessageToFeed(arg);
      } else if (arg.messageType === BaseClient.MessageTypes.ROOM_MEMBER_STATUS_EVENT) {
        this.handleRoomMemberStatusEvent(arg);
      } else if (arg.messageType === BaseClient.MessageTypes.MOOVIE_STATUS_UPDATE) {
        this.handleMoovieStatusUpdate(arg);
      }
    }
  };

  /**
   * Handle moovie status update for our moovie
   */
  handleMoovieStatusUpdate(arg) {
    console.log(arg.data);
    this.setState({
      moovie: arg.data
    });
  }

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
    const isPuppet = (talkMessage.messageType === BaseClient.MessageTypes.PUPPET_MESSAGE);

    this.setState((prevState) => {
      const newMessage = {
        username: username,
        time: time,
        texts: [talkMessage.data.message],
        isMe: isMe,
        isPuppet: isPuppet,
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
      if (lastMessage.time === newMessage.time
        && lastMessage.username === newMessage.username
        && lastMessage.isPuppet === newMessage.isPuppet) {
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
        console.log("MOOOOVIE!!");
        console.log(moovie);
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

  addMontyIntroMessage(moovie) {
    let montyIntroMsgs = this.puppet.getMontyIntroMessage(moovie);

    setTimeout(() => {
      this.setState((prevState) => {
        return this.updateMessages(prevState.messages, montyIntroMsgs[0]);
      });
      setTimeout(() => {
        this.setState((prevState) => {
          return this.updateMessages(prevState.messages, montyIntroMsgs[1]);
        });
        setTimeout(() => {
          this.setState((prevState) => {
            return this.updateMessages(prevState.messages, montyIntroMsgs[2]);
          });
        }, 3000);
      }, 3000);
    }, 1000);

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

    this.puppet.runMontyStartMoovieScript(this.state.moovie, () => {
      MoovieClient.startMoovie(this.state.moovie.id, this, (arg) => {
        this.handleMoovieResponse(arg);
      });
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

    this.puppet.runMontyStartMoovieScript(this.state.moovie, () => {
      MoovieClient.resumeMoovie(this.state.moovie.id, this, (arg) => {
        this.handleMoovieResponse(arg);
      });
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
      //moovie status is updated by talk messages now
      console.log("moovie status call succeeded!");
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
          <ChatInput isConsoleOpen={this.props.isConsoleOpen} onEnterKey={this.onEnterKey} onOpenEmojiPicker={this.onOpenEmojiPicker}/>
        </div>
      </div>
    );
  }

}
