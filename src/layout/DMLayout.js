import React, {Component} from "react";
import ChatInput from "./moovie/ChatInput";
import {TalkToClient} from "../clients/TalkToClient";
import {RendererEventFactory} from "../events/RendererEventFactory";
import {BaseClient} from "../clients/BaseClient";
import ChatFeed from "./moovie/ChatFeed";
import UtilRenderer from "../UtilRenderer";
import {MemberClient} from "../clients/MemberClient";
import ChatPeekPopup from "./moovie/ChatPeekPopup";
import FervieButton from "./dm/FervieButton";
import MessageBanner from "./dm/MessageBanner";
import moment from "moment";

/**
 * this component is the layout for the always-on-top chat overlay panel
 */
export default class DMLayout extends Component {

  static roomMemberPropStr = "roomMember";

  static chatReactionTypeAdd = "ADD";
  static chatReactionTypeRemove = "REMOVE";

  /**
   * Initialize the component
   * @param props - the properties of the component to render
   */
  constructor(props) {
    super(props);
    this.name = "[DMLayout]";
    this.state = {
      messages : [],
      circuitMembers : [],
      buddiesById: new Map(),
      memberByIdMap: new Map(),
      member: null
    };

    this.directMessageListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.TALK_MESSAGE_CLIENT,
        this,
        this.onTalkDirectMessage
      );

  }

  /**
   * Called when the chat console is first loaded
   */
  componentDidMount = () => {

    console.log("memberID = "+this.props.memberId);
    MemberClient.getMemberById(this.props.memberId, this, (arg) => {
      if (!arg.error) {
        //below is a work around since we're using teamMemberDto in place of circuitMemberStatusDto
        arg.data.memberId = this.props.memberId;

        this.setState({
          member: arg.data,
          circuitMembers: [arg.data],
          buddiesById: this.createMap(this.props.memberId, arg.data),
          memberByIdMap: this.createMap(this.props.memberId, arg.data)
        });
      } else {
        console.error("Unable to load member: "+arg.error);
      }
    });
  };

  /**
   * When one of the properties or state variable has changed
   * @param prevProps
   * @param prevState
   * @param snapshot
   */
  componentDidUpdate(prevProps, prevState, snapshot) {
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
  //
  //
  // /**
  //  * Handle chat room messages
  //  * @param event
  //  * @param arg
  //  */
  // onTalkRoomMessage = (event, arg) => {
  //   if (arg.uri === this.state.moovie.talkRoomId) {
  //     if (arg.messageType === BaseClient.MessageTypes.CHAT_MESSAGE_DETAILS) {
  //       this.props.onMessageSlideWindow();
  //       this.addMessageToFeed(arg);
  //
  //     } else if (arg.messageType === BaseClient.MessageTypes.PUPPET_MESSAGE) {
  //       this.addMessageToFeed(arg);
  //     } else if (arg.messageType === BaseClient.MessageTypes.ROOM_MEMBER_STATUS_EVENT) {
  //       this.handleRoomMemberStatusEvent(arg);
  //     } else if (arg.messageType === BaseClient.MessageTypes.MOOVIE_STATUS_UPDATE) {
  //       this.handleMoovieStatusUpdate(arg);
  //     } else if (arg.messageType === BaseClient.MessageTypes.CHAT_REACTION) {
  //       this.handleChatReaction(arg.data);
  //     }
  //   }
  // };

  /**
   * Handle direct messages like buddy status updates
   * @param event
   * @param arg
   */
  onTalkDirectMessage = (event, arg) => {
    console.log("message received!");

    let metaProps = arg.metaProps,
      messageFromMemberId = UtilRenderer.getMemberIdFromMetaProps(metaProps);

    console.log(messageFromMemberId);
    console.log("props: "+this.props.memberId);

    //TODO handle direct message responses from this specific user
    if (messageFromMemberId === this.props.memberId) {
      if (arg.messageType === BaseClient.MessageTypes.CHAT_MESSAGE_DETAILS) {
        this.addMessageToFeed(arg);
      } else if (arg.messageType === BaseClient.MessageTypes.CHAT_REACTION) {
        this.handleChatReaction(messageFromMemberId, arg.data);
      } else if (arg.messageType === BaseClient.MessageTypes.BUDDY_STATUS_EVENT) {
        this.handleBuddyStatusUpdate(arg.data);
      }
    }


  };

  createMap(id, mapItem) {
    const map = new Map();
    map.set(id, mapItem);
    return map;
  }

  handleBuddyStatusUpdate(buddyEvent) {
    if (buddyEvent.buddy.sparkId === this.props.memberId) {
      this.setState({
        member: buddyEvent.buddy
      });
    }
  }

  /**
   * Handle emoji change to one of the messages in the chat feed
   * @param reactionInput
   */
  handleChatReaction(messageFromMemberId, reactionInput) {
    console.log(reactionInput);
    this.setState((prevState) => {
      const foundText = this.findMessageTextWithId(prevState.messages, reactionInput.messageId);
      if (foundText) {
        if (reactionInput.chatReactionChangeType === DMLayout.chatReactionTypeAdd) {
          this.addReactionToGroup(foundText.reactions,
            {
                          memberIds: [reactionInput.memberId],
                          emoji: reactionInput.emoji
                        });
        } else if (reactionInput.chatReactionChangeType === DMLayout.chatReactionTypeRemove) {
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
   * Add the chat message to the message feed for display
   */
  addMessageToFeed(talkMessage) {
    console.log(talkMessage);
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
   * If two messages at the same time, condense the data to display
   * bubbles adjacent without the timestamp underneath.
   */
  updateMessages(messages, newMessage) {

    console.log("update messages");
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
      console.log("push");
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
   * When we click on the fervie app icon
   */
  onClickFervie = () => {
    this.props.onClickAppIcon();
  }

  /**
   * When we exit with the fervie app icon
   */
  onFervieExit = () => {
    this.props.onAppExit();
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
     TalkToClient.reactToDirectMessage(this.props.memberId, messageId, emoji, this, (arg) => {
       if (arg.error) {
         console.error("Error adding reaction! "+arg.error)
       } else {
         this.setState((prevState) => {
           const textObj = this.findMessageTextWithId(prevState.messages, messageId);
           this.addReactionToGroup(textObj.reactions, {memberIds: [MemberClient.me.id], emoji: emoji}, isLocalOnly);
           return {
             messages: prevState.messages
           }
         });

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
      TalkToClient.clearReactionToDirectMessage(this.props.memberId, messageId, emoji, this, (arg) => {
        if (arg.error) {
          console.error("Error removing reaction! " + arg.error)
        } else {
          this.setState((prevState) => {
            const foundText = this.findMessageTextWithId(prevState.messages, messageId);
            if (foundText) {
              this.removeReactionFromGroup(foundText.reactions, MemberClient.me.id, emoji);
            }
            return {
              messages: prevState.messages
            }
          });
          console.log("reaction removed");
        }
      });
    }
  }

  /**
   * sends a new text message to the server over direct messaging
   * @param text
   * @param callback
   */
  addChatMessage = (text, callback) => {
    TalkToClient.publishChatToDM(this.props.memberId, text, this, (arg) => {
      if (!arg.error) {
        console.log("chat published");
        this.addMessageToFeed(arg.data);
        //this.echoChatMessageToFeed(text);
      } else {
        console.error("Unable to publish chat: "+arg.error);
      }
      if (callback) {
        callback();
      }
    });
  };

  /**
   * When we send a direct text message, the message doesn't echo back over talk
   * so do this echo back ourselves
   * @param text
   */
  echoChatMessageToFeed(text) {

     this.setState((prevState) => {
       const id = this.state.messages.length;

       const me = MemberClient.me;
       let username = "notloaded";
       if (me) {
         username = me.username;
       }

       const msg = {
         id: id,
         username: username,
         time: moment().utc().local().calendar(),
         texts: [{id:id, message:text, reactions:[]}],
         isMe: true,
         isPuppet: false,
         isLocalOnly: true};
       return this.updateMessages(prevState.messages, msg);
     });

  }

  getChatPeekPopup() {
    let visibility = "none";
    if (this.props.showPeekView) {
      visibility = "block";
    }
    return (
      <div id="component" className="moovieChat peekWindow" style={{display : visibility}}>
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
        <MessageBanner member={this.state.member}/>
        <div id={ChatFeed.feedWindowId} className="chatFeed smoothScroll message" >
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
          <FervieButton member={this.state.member}
                        isConsoleOpen={this.props.isConsoleOpen}
                       onClickFervie={this.onClickFervie}
                       onFervieExit={this.onFervieExit}/>
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
