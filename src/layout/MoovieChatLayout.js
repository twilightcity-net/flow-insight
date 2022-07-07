import React, {Component} from "react";
import ChatInput from "./shared/ChatInput";
import {MoovieClient} from "../clients/MoovieClient";
import {TalkToClient} from "../clients/TalkToClient";
import {RendererEventFactory} from "../events/RendererEventFactory";
import {BaseClient} from "../clients/BaseClient";
import ChatFeed from "./shared/ChatFeed";
import UtilRenderer from "../UtilRenderer";
import {MemberClient} from "../clients/MemberClient";
import CircuitMemberHelper from "./shared/CircuitMemberHelper";
import MontyButton from "./moovie/MontyButton";
import MoovieBanner from "./moovie/MoovieBanner";
import MontyPuppet from "./moovie/MontyPuppet";
import {FervieClient} from "../clients/FervieClient";
import ChatPeekPopup from "./moovie/ChatPeekPopup";

/**
 * this component is the layout for the always-on-top chat overlay panel
 */
export default class MoovieChatLayout extends Component {

  static roomMemberPropStr = "roomMember";

  static chatReactionTypeAdd = "ADD";
  static chatReactionTypeRemove = "REMOVE";

  /**
   * Initialize the component
   * @param props - the properties of the component to render
   */
  constructor(props) {
    super(props);
    this.name = "[MoovieChatLayout]";
    this.state = {
      messages : [],
      circuitMembers : [],
      buddiesById: new Map(),
      memberByIdMap: new Map(),
      moovie: null,
      hasLoadedMessages: false
    };

    this.hasMontyDoneIntro = false;

    this.talkRoomMessageListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.TALK_MESSAGE_ROOM,
        this,
        this.onTalkRoomMessage
      );

    this.directMessageListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.TALK_MESSAGE_CLIENT,
        this,
        this.onTalkDirectMessage
      );

    this.moovieStartNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.MOOVIE_START,
        this
      );

    this.moovieStopNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.MOOVIE_STOP,
        this
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
      this.refreshMoovieData(this.props.moovieId);
    }
  };

  /**
   * When one of the properties or state variable has changed
   * @param prevProps
   * @param prevState
   * @param snapshot
   */
  componentDidUpdate(prevProps, prevState, snapshot) {
    if ((!prevProps.isConsoleOpen && this.props.isConsoleOpen && !this.hasMontyDoneIntro && this.state.hasLoadedMessages)
      || (this.props.isConsoleOpen && !prevState.hasLoadedMessages && this.state.hasLoadedMessages)
    ) {
      this.hasMontyDoneIntro = true;
      this.addMontyIntroMessage(this.state.moovie);
    }

    if (!prevProps.isConsoleOpen && this.props.isConsoleOpen) {
      let chatInput = document.getElementById(ChatInput.chatInputId);
      if (chatInput) {
        chatInput.focus();
      }
    }

    if (prevProps.showPeekView && !this.props.showPeekView) {
      let el = document.getElementById(ChatFeed.feedWindowId);
      if (el) {
        el.classList.remove("smoothScroll");
        el.scrollTop = el.scrollHeight;
        setTimeout(() => {
          el.classList.add("smoothScroll");
        }, 33);
      }
      let chatInput = document.getElementById(ChatInput.chatInputId);
      if (chatInput) {
        chatInput.focus();
      }
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

  /**
   * Handle chat room messages
   * @param event
   * @param arg
   */
  onTalkRoomMessage = (event, arg) => {
    if (arg.uri === this.state.moovie.talkRoomId) {
      if (arg.messageType === BaseClient.MessageTypes.CHAT_MESSAGE_DETAILS) {
        this.props.onMessageSlideWindow();
        this.addMessageToFeed(arg);
      } else if (arg.messageType === BaseClient.MessageTypes.PUPPET_MESSAGE) {
        this.addMessageToFeed(arg);
      } else if (arg.messageType === BaseClient.MessageTypes.ROOM_MEMBER_STATUS_EVENT) {
        this.handleRoomMemberStatusEvent(arg);
      } else if (arg.messageType === BaseClient.MessageTypes.MOOVIE_STATUS_UPDATE) {
        this.handleMoovieStatusUpdate(arg);
      } else if (arg.messageType === BaseClient.MessageTypes.CHAT_REACTION) {
        this.handleChatReaction(arg.data);
      }
    }
  };

  /**
   * Handle direct messages like buddy status updates
   * @param event
   * @param arg
   */
  onTalkDirectMessage = (event, arg) => {
    if (arg.messageType === BaseClient.MessageTypes.BUDDY_STATUS_EVENT) {
      if (arg.data.buddyEventType === "BUDDY_ADDED") {
        this.addBuddyToMap(arg.data);
      }
    }
  };

  /**
   * Add a buddy to our buddies map that shows whether or not a chat member is a buddy
   * @param buddyEvent
   */
  addBuddyToMap(buddyEvent) {
    this.setState((prevState) => {
      const buddy = buddyEvent.buddy;
      prevState.buddiesById.set(buddy.sparkId, buddy);
      return {
        buddiesById: prevState.buddiesById
      };
    });
  }

  /**
   * Handle moovie status update for our moovie
   */
  handleMoovieStatusUpdate(arg) {
    this.setState({
      moovie: arg.data
    });
  }

  /**
   * Handle emoji change to one of the messages in the chat feed
   * @param reactionInput
   */
  handleChatReaction(reactionInput) {
    this.setState((prevState) => {
      const foundText = this.findMessageTextWithId(prevState.messages, reactionInput.messageId);
      console.log("looking for : "+reactionInput.messageId);
      if (foundText) {
        console.log("Found it!");
        console.log(foundText);
        if (reactionInput.chatReactionChangeType === MoovieChatLayout.chatReactionTypeAdd) {
          this.addReactionToGroup(foundText.reactions,
            {
                          memberIds: [reactionInput.memberId],
                          emoji: reactionInput.emoji
                        });
        } else if (reactionInput.chatReactionChangeType === MoovieChatLayout.chatReactionTypeRemove) {
          this.removeReactionFromGroup(foundText.reactions, reactionInput.memberId, reactionInput.emoji);
        }
      }

      return {
        messages: prevState.messages
      }
    });
  }

  /**
   * Add an emoji reaction to a group of reactions
   * @param reactions
   * @param newReaction
   * @param isLocalOnly
   */
  addReactionToGroup(reactions, newReaction, isLocalOnly) {

    const memberId = newReaction.memberIds[0];
    for (let reaction of reactions) {
      if (reaction.emoji === newReaction.emoji) {
        let memberAlreadyFound = false;
        if (isLocalOnly) {
          for (let reactionMemberId of newReaction.memberIds) {
            if (reactionMemberId === memberId) {
              memberAlreadyFound = true;
              break;
            }
          }
        }
        if (!memberAlreadyFound) {
          reaction.memberIds.push(memberId);
        }
        return;
      }
    }
    reactions.push(newReaction);
  }

  /**
   * Remove the reaction from a specific memberId for specific emoji.  If the particular emoji
   * only has one memberId reaction, remove the entire reaction entry
   * @param reactions
   * @param memberId
   * @param emoji
   */
  removeReactionFromGroup(reactions, memberId, emoji) {
    const indexOfReactionByMember = this.findIndexesOfReactionByMember(reactions, memberId, emoji);
    if (indexOfReactionByMember[0] >= 0) {
      const reaction = reactions[indexOfReactionByMember[0]];
      if (reaction.memberIds.length > 1) {
        reaction.memberIds.splice(indexOfReactionByMember[1], 1);
      } else {
        reactions.splice(indexOfReactionByMember[0], 1);
      }
    }
  }

  /**
   * Find a message text object matching the passed in id,
   * or return null if not found
   * @param messages
   * @param id
   */
  findMessageTextWithId(messages, id) {
    for (let message of messages) {
      for (let text of message.texts) {
        if (text.id === id) {
          return text;
        }
      }
    }
    return null;
  }

  /**
   * Find the index within the text of a reaction by the specified member.
   * And the index of the member within the reaction.
   * If we are removing the reaction, we need to find it first
   * @param reactions
   * @param memberId
   * @param emoji
   */
  findIndexesOfReactionByMember(reactions, memberId, emoji) {
    let reaction;
    for (let i = 0; i < reactions.length; i++) {
      reaction = reactions[i];
      if (reaction.emoji === emoji) {
        for (let j = 0; j < reactions[i].memberIds.length; j++) {
          if (reactions[i].memberIds[j] === memberId) {
            return [i,j];
          }
        }
      }
    }

    return [-1,-1];
  }

  /**
   * When a member joins the room, we need to fetch their fervie member profile info,
   * So we can display the proper fervie color and accessories in the icon
   * @param arg
   */
  handleRoomMemberStatusEvent(arg) {
    let data = arg.data,
      roomMember = data[MoovieChatLayout.roomMemberPropStr];

    let metaProps = arg.metaProps,
      username = UtilRenderer.getUsernameFromMetaProps(metaProps);

    if (data.statusEvent === BaseClient.RoomMemberStatus.ROOM_MEMBER_JOIN) {
      this.memberHelper.addMemberIfMissing(username, roomMember);
      const allMembers = this.memberHelper.getAllMembers();
      this.setState({
        circuitMembers : allMembers,
        memberByIdMap: this.memberHelper.createMemberByIdMap(allMembers)}
      );
      this.addStatusToChat(roomMember.fervieName + " joined the moovie.");
    }
  }


  /**
   * Loads all the past messages from the local DB into a state that we can use
   * for the chat feed display
   * @param talkMessages
   */
  handleLoadMessages(talkMessages) {
    let messages = [];

    let me = MemberClient.me;
    for (let talkMessage of talkMessages) {
      console.log(talkMessage);
      if (talkMessage.messageType === BaseClient.MessageTypes.CHAT_MESSAGE_DETAILS) {

        const metaProps = talkMessage.metaProps;
        const username = UtilRenderer.getUsernameFromMetaProps(metaProps);
        const memberId = UtilRenderer.getMemberIdFromMetaProps(metaProps);
        const time = UtilRenderer.getChatMessageTimeString(talkMessage.messageTime);
        const isMe = (memberId === me.id);
        const isPuppet = (talkMessage.messageType === BaseClient.MessageTypes.PUPPET_MESSAGE);

        const newMessage = {
          id : talkMessage.id,
          username: username,
          time: time,
          texts: [{
            id: talkMessage.id,
            message: talkMessage.data.message,
            reactions:[]
          }],
          isMe: isMe,
          isPuppet: isPuppet,
          isLocalOnly: false,
        };
        messages = this.addMessage(messages, newMessage);
      } else if (talkMessage.messageType === BaseClient.MessageTypes.CHAT_REACTION) {
        console.log("wootx!");

        const messageId = talkMessage.data.messageId;
        const memberId = talkMessage.data.memberId;
        const emoji = talkMessage.data.emoji;
        const textObj = this.findMessageTextWithId(messages, messageId);
        if (textObj) {
          this.addReactionToGroup(textObj.reactions, {memberIds: [memberId], emoji: emoji}, false);
        } else {
          console.error("MessageId not found!");
        }

      }
    }

    this.setState({
      hasLoadedMessages: true,
      messages: messages
    });
    return messages;
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
        id : talkMessage.id,
        username: username,
        time: time,
        texts: [{
          id: talkMessage.id,
          message: talkMessage.data.message,
          reactions:[]
        }],
        isMe: isMe,
        isPuppet: isPuppet,
        isLocalOnly: false,
        fervieColor: null,
        fervieAccessory: "SUNGLASSES",
        tertiaryColor: null
      };
      return this.updateMessages(prevState.messages, newMessage);

    });
  }

  /**
   * Updates messages to the list without copying the whole list
   */
  addMessage(messages, newMessage) {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.time === newMessage.time
        && lastMessage.username === newMessage.username
        && lastMessage.isPuppet === newMessage.isPuppet) {

        lastMessage.texts.push(newMessage.texts[0]);
        messages[messages.length - 1] = lastMessage;
      } else {
        messages.push(newMessage);
      }
    } else {
      messages.push(newMessage);
    }

    return messages;
  }

  /**
   * If two messages at the same time, condense the data to display
   * bubbles adjacent without the timestamp underneath.
   */
  updateMessages(messages, newMessage) {

    const messagesCopy = [...messages];

    if (messages.length > 0) {
      const lastMessage = messagesCopy[messages.length - 1];
      if (lastMessage.time === newMessage.time
        && lastMessage.username === newMessage.username
        && lastMessage.isPuppet === newMessage.isPuppet) {

        const lastMessageCopy = this.cloneMessage(lastMessage);
        lastMessageCopy.texts.push(newMessage.texts[0]);
        messagesCopy[messagesCopy.length - 1] = lastMessageCopy;
      } else {
        messagesCopy.push(newMessage);
      }
    } else {
      messagesCopy.push(newMessage);
    }

    return {
      messages: messagesCopy
    }
  }

  cloneMessage(message) {
    const clonedMessage = {};
    Object.assign(clonedMessage, message);

    clonedMessage.texts = [];
    clonedMessage.texts = [...message.texts];

    return clonedMessage;
  }

  /**
   * Load the moovie circuit, circuit members, and connect to the chat room
   * @param moovieId
   */
  refreshMoovieData(moovieId) {
    this.loadMoovieCircuitAndConnectToRoom(moovieId);
    this.loadMoovieCircuitMembers();
    this.loadBuddies();
  }

  /**
   * Load the moovie circuit and connect to the room, then update the moovie
   * state
   * @param moovieId
   */
  loadMoovieCircuitAndConnectToRoom(moovieId) {
    MoovieClient.getMoovieCircuit(moovieId, this, (arg) => {
      if (!arg.error) {
        const moovie = arg.data;
        this.connectToRoomAndLoadMessages(moovie);
        this.setState({
          moovie: moovie
        });
      } else {
        console.error("Unable to load moovie circuit: " + arg.error);
      }
    });
  }

  reloadMoovieCircuit() {
    MoovieClient.getMoovieCircuit(this.props.moovieId, this, (arg) => {
      if (!arg.error) {
        const moovie = arg.data;
        this.setState({
          moovie: moovie
        });
      } else {
        console.error("Unable to load moovie circuit: " + arg.error);
      }
    });
  }

  /**
   * Load up our buddies list so we know when someone is a friend or not
   * for display in the chat
   */
  loadBuddies() {
    FervieClient.getBuddyList(this, (arg) => {
      if (!arg.error) {
        this.setState({
          buddiesById: this.createBuddyByIdMap(arg.data)
        });
      }
    });
  }

  createBuddyByIdMap(buddies) {
    const map = new Map();
    for (let buddy of buddies) {
      map.set(buddy.sparkId, buddy);
    }
    return map;
  }

  /**
   * Load the member profiles for those in the circuit
   * so we can display the fervie profile pictures and names of peeps
   */
  loadMoovieCircuitMembers() {
    this.memberHelper.loadMembers((members) => {
      this.setState({
        circuitMembers: members,
        memberByIdMap: this.memberHelper.createMemberByIdMap(members)
      })
    });
  }

  /**
   * Connect to the talk room so we get the chat message events
   * @param moovie
   */
  connectToRoomAndLoadMessages(moovie) {
    TalkToClient.joinExistingRoom(moovie.talkRoomId, this, (arg) => {
      if (!arg.error) {
        console.log("room joined");
        this.loadMessagesFromRoom(moovie);
      } else {
        console.error("Unable to join room: " + arg.error);
      }
    });

  }

  loadMessagesFromRoom(moovie) {
    TalkToClient.getAllTalkMessagesFromRoom(moovie.talkRoomId, moovie.talkRoomId, this, (arg) => {
      if (!arg.error) {
         this.handleLoadMessages(arg.data);
      } else {
        console.error("Unable to retrieve room messages: " + arg.error);
      }
    });
  }

  /**
   * Make Monty do his little talking intro spiel
   * @param moovie
   */
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
        if (!arg.error) {
          this.moovieStartNotifier.dispatch({});
        }
        this.handleMoovieResponse(arg, "start");
      });
    });
  }

  onPauseMoovie = () => {
    console.log("onPauseMoovie");
    if (!this.state.moovie) return;

    MoovieClient.pauseMoovie(this.state.moovie.id, this, (arg) => {
      if (!arg.error) {
        this.moovieStopNotifier.dispatch({});
      }
      this.handleMoovieResponse(arg, "pause");
    });
  }

  onResumeMoovie = () => {
    console.log("onResumeMoovie");
    if (!this.state.moovie) return;

    this.puppet.runMontyStartMoovieScript(this.state.moovie, () => {
      MoovieClient.resumeMoovie(this.state.moovie.id, this, (arg) => {
        if (!arg.error) {
          this.moovieStartNotifier.dispatch({});
        }
        this.handleMoovieResponse(arg, "resume");
      });
    });
  }

  onRestartMoovie = () => {
    console.log("onRestartMoovie");
    if (!this.state.moovie) return;
    MoovieClient.restartMoovie(this.state.moovie.id, this, (arg) => {
      this.handleMoovieResponse(arg, "restart");
    });
  }

  handleMoovieResponse(arg, action) {
    if (!arg.error) {
      //moovie status is updated by talk messages now
      console.log("moovie status call succeeded!");
    } else {
      console.error("Error: "+arg.error);
      this.addErrorToChat("Unable to " + action + " moovie.  Please wait a moment and try again.");
      this.reloadMoovieCircuit(); //status might be out of sync somehow try to correct
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

  onAddBuddy = (circuitMember) => {
    console.log("onAddBuddy!");

    FervieClient.requestBuddyLink(circuitMember.memberId, this, (arg) => {
      if (arg.error) {
        console.error("Unable to request buddy link: "+arg.error);
      } else {
        console.log("Buddy request sent");
      }
    });
  }

  onActivateFullChatWindow = () => {
    this.props.onActivateFullChatWindow();
  }

  /**
   * When we add a reaction to a message in the chat
   * @param messageId
   * @param emoji
   * @param isLocalOnly
   */
  onAddReaction = (messageId, emoji, isLocalOnly) => {
   console.log("add reaction!");

   if (isLocalOnly) {
     this.setState((prevState) => {
       const textObj = this.findMessageTextWithId(prevState.messages, messageId);
       this.addReactionToGroup(textObj.reactions, {memberIds: [MemberClient.me.id], emoji: emoji}, isLocalOnly);
       return {
         messages: prevState.messages
       }
     });
   } else {
     TalkToClient.reactToMessage(this.state.moovie.talkRoomId, messageId, emoji, this, (arg) => {
       if (arg.error) {
         console.error("Error adding reaction! "+arg.error)
       } else {
         console.log("reaction added");
       }
     });
   }
  }

  /**
   * When we remove a reaction on a message in the chat
   * @param messageId
   * @param emoji
   * @param isLocalOnly
   */
  onRemoveReaction = (messageId, emoji, isLocalOnly) => {
    if (isLocalOnly) {
      this.setState((prevState) => {
        const foundText = this.findMessageTextWithId(prevState.messages, messageId);
        if (foundText) {
            this.removeReactionFromGroup(foundText.reactions, MemberClient.me.id, emoji);
        }
        return {
          messages: prevState.messages
        }
      });
    } else {
      TalkToClient.clearReactionToMessage(this.state.moovie.talkRoomId, messageId, emoji, this, (arg) => {
        if (arg.error) {
          console.error("Error removing reaction! " + arg.error)
        } else {
          console.log("reaction removed");
        }
      });
    }
  }


  /**
   * Add error message to chat
   */
  addErrorToChat(errorMessage) {

    this.setState((prevState) => {

      const newMessage = {
        id : -99,
        username: "Fervie",
        time: "",
        texts: [{
          id: -99,
          message: errorMessage,
          reactions:[]
        }],
        isMe: false,
        isPuppet: false,
        isLocalOnly: false,
        fervieColor: null,
        fervieAccessory: null,
        tertiaryColor: null,
        isErrorMsg: true
      };
      return this.updateMessages(prevState.messages, newMessage);
    });
  }


  /**
   * Add status message to chat
   */
  addStatusToChat(statusMessage) {

    this.setState((prevState) => {

      const newMessage = {
        id : -99,
        username: "Fervie",
        time: "",
        texts: [{
          id: -99,
          message: statusMessage,
          reactions:[]
        }],
        isMe: false,
        isPuppet: false,
        isLocalOnly: false,
        fervieColor: null,
        fervieAccessory: null,
        tertiaryColor: null,
        isStatusMsg: true
      };
      return this.updateMessages(prevState.messages, newMessage);
    });
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
            this.addErrorToChat("Unable to publish chat message.  Please wait and try again.");
          }
          if (callback) {
            callback();
          }
        }
      );
    }
  };

  getChatPeekPopup() {
    let visibility = "none";
    if (this.props.showPeekView) {
      visibility = "block";
    }
    return (
      <div id="component" className="chatWindow peekWindow" style={{display : visibility}}>
        <div id={ChatPeekPopup.feedWindowId} className="chatFeed smoothScroll">
        <ChatPeekPopup circuitMembers={this.state.circuitMembers}
                       buddiesById={this.state.buddiesById}
                       memberByIdMap={this.state.memberByIdMap}
                       messages={this.state.messages}
                       onActivateFullChatWindow={this.onActivateFullChatWindow}
                       onAddReaction={this.onAddReaction}
                       onRemoveReaction={this.onRemoveReaction}
                       onAddBuddy={this.onAddBuddy}/>
        </div>
      </div>);
  }


  getFullChatView() {
    let visibility = "none";
    if (!this.props.showPeekView) {
      visibility = "block";
    }
    return (
      <div id="component" className="chatWindow" style={{display : visibility}}>
        <MoovieBanner moovie={this.state.moovie}/>
        <div id={ChatFeed.feedWindowId} className="chatFeed smoothScroll" >
          {<ChatFeed circuitMembers={this.state.circuitMembers}
                     buddiesById={this.state.buddiesById}
                     memberByIdMap={this.state.memberByIdMap}
                     messages={this.state.messages}
                     onAddReaction={this.onAddReaction}
                     onRemoveReaction={this.onRemoveReaction}
                     onAddBuddy={this.onAddBuddy}
          />}
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
          <ChatInput isConsoleOpen={this.props.isConsoleOpen} onEnterKey={this.onEnterKey}
                     onOpenEmojiPicker={this.onOpenEmojiPicker}/>
        </div>
      </div>
    );
  }


  /**
   * renders the chat console layout
   * @returns {*} - the JSX to render
   */
  render() {
    return (
    <div>
      {this.getChatPeekPopup()}
      {this.getFullChatView()}
    </div>
    );
  }

}
